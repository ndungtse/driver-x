import requests
from django.conf import settings
from ..models import Trip, Route, RequiredStop, RequiredStopType


class RouteCalculator:
    """
    Calculates routes and required stops for trips using Google Directions API.
    """
    
    @staticmethod
    def _format_location(location):
        """
        Format location dict to string for Google Directions API.
        
        Args:
            location: dict with address, latitude, longitude, etc.
            
        Returns:
            String address or lat,lng format
        """
        if not location:
            return None
        
        # Prefer formatted address
        if location.get('address'):
            return location['address']
        
        # Fall back to lat,lng
        if location.get('latitude') and location.get('longitude'):
            return f"{location['latitude']},{location['longitude']}"
        
        return None
    
    @staticmethod
    def _calculate_distance_from_api(trip):
        """
        Calculate route distance using Google Directions API.
        
        Args:
            trip: Trip instance
            
        Returns:
            tuple: (distance_miles, duration_hours, waypoints_list) or (None, None, None) on error
        """
        api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', '')
        if not api_key:
            return None, None, None
        
        # Build waypoints for the route: current -> pickup -> dropoff
        origins = []
        destinations = []
        waypoints_list = []
        
        current = RouteCalculator._format_location(trip.current_location)
        pickup = RouteCalculator._format_location(trip.pickup_location)
        dropoff = RouteCalculator._format_location(trip.dropoff_location)
        
        if not current or not dropoff:
            return None, None, None
        
        origins.append(current)
        destinations.append(dropoff)
        
        if pickup and pickup != current and pickup != dropoff:
            waypoints_list.append(pickup)
        
        # Build Google Directions API request
        url = 'https://maps.googleapis.com/maps/api/directions/json'
        params = {
            'origin': origins[0],
            'destination': destinations[0],
            'waypoints': '|'.join(waypoints_list) if waypoints_list else None,
            'key': api_key,
            'units': 'imperial',  # Get results in miles
        }
        
        # Remove None values
        params = {k: v for k, v in params.items() if v is not None}
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('status') != 'OK' or not data.get('routes'):
                return None, None, None
            
            route = data['routes'][0]
            
            # Calculate total distance and duration
            total_distance_meters = 0
            total_duration_seconds = 0
            
            for leg in route.get('legs', []):
                if leg.get('distance', {}).get('value'):
                    total_distance_meters += leg['distance']['value']
                if leg.get('duration', {}).get('value'):
                    total_duration_seconds += leg['duration']['value']
            
            # Convert to miles and hours
            distance_miles = total_distance_meters / 1609.34
            duration_hours = total_duration_seconds / 3600
            
            # Extract waypoints from route
            waypoints = []
            for leg in route.get('legs', []):
                start_location = leg.get('start_location', {})
                if start_location:
                    waypoints.append({
                        'latitude': start_location.get('lat'),
                        'longitude': start_location.get('lng'),
                        'address': leg.get('start_address', ''),
                    })
            
            # Add final destination
            if route.get('legs'):
                end_location = route['legs'][-1].get('end_location', {})
                if end_location:
                    waypoints.append({
                        'latitude': end_location.get('lat'),
                        'longitude': end_location.get('lng'),
                        'address': route['legs'][-1].get('end_address', ''),
                    })
            
            return distance_miles, duration_hours, waypoints
            
        except (requests.RequestException, KeyError, ValueError) as e:
            # Log error or handle gracefully
            return None, None, None
    
    @staticmethod
    def calculate_route(trip):
        """
        Calculate route from trip locations using Google Directions API.
        
        Args:
            trip: Trip instance
            
        Returns:
            Route instance with calculated waypoints and distance
        """
        route, created = Route.objects.get_or_create(trip=trip)
        
        # Try to calculate using Google API
        distance_miles, duration_hours, waypoints_list = RouteCalculator._calculate_distance_from_api(trip)
        print(f"distance_miles: {distance_miles}, duration_hours: {duration_hours}, waypoints_list: {waypoints_list}")
        
        if distance_miles is not None:
            route.total_distance = distance_miles
            route.estimated_time = duration_hours
            route.waypoints = waypoints_list or [
                trip.current_location,
                trip.pickup_location,
                trip.dropoff_location
            ]
        else:
            # Fallback to rough calculation if API fails
            pickup = trip.pickup_location
            dropoff = trip.dropoff_location
            current = trip.current_location
            
            if current.get('latitude') and dropoff.get('latitude'):
                # Simple Haversine-like approximation
                from math import radians, cos, sin, asin, sqrt
                
                def haversine(lat1, lon1, lat2, lon2):
                    R = 3959  # Earth radius in miles
                    dlat = radians(lat2 - lat1)
                    dlon = radians(lon2 - lon1)
                    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
                    c = 2 * asin(sqrt(a))
                    return R * c
                
                # Calculate current to dropoff distance
                distance_miles = haversine(
                    current['latitude'], current['longitude'],
                    dropoff['latitude'], dropoff['longitude']
                )
                
                # If pickup exists, add it to the route
                if pickup.get('latitude'):
                    distance_to_pickup = haversine(
                        current['latitude'], current['longitude'],
                        pickup['latitude'], pickup['longitude']
                    )
                    distance_from_pickup = haversine(
                        pickup['latitude'], pickup['longitude'],
                        dropoff['latitude'], dropoff['longitude']
                    )
                    distance_miles = distance_to_pickup + distance_from_pickup
                
                route.total_distance = distance_miles
                route.estimated_time = distance_miles / 55  # Assume 55 mph average
                route.waypoints = [
                    trip.current_location,
                    trip.pickup_location,
                    trip.dropoff_location
                ]
            else:
                route.total_distance = 0
                route.estimated_time = 0
                route.waypoints = [
                    trip.current_location,
                    trip.pickup_location,
                    trip.dropoff_location
                ]
        
        route.save()
        
        # Update trip's total_distance
        trip.total_distance = route.total_distance
        trip.estimated_duration = route.estimated_time
        trip.save()
        
        # Calculate required stops
        RouteCalculator.calculate_required_stops(route)
        
        return route
    
    @staticmethod
    def calculate_required_stops(route):
        """
        Calculate required stops based on distance and HOS rules.
        
        Args:
            route: Route instance
        """
        # Clear existing stops
        route.stops.all().delete()
        
        total_distance = route.total_distance
        distance_covered = 0
        
        # Fuel stops every 1000 miles
        while distance_covered + 1000 < total_distance:
            distance_covered += 1000
            
            RequiredStop.objects.create(
                route=route,
                type=RequiredStopType.FUEL,
                location={},  # TODO: Will find actual fuel station via Mapbox
                duration_minutes=15,  # Typical fuel stop
                miles_from_start=distance_covered,
                reason='Fueling required every 1,000 miles'
            )
        
        # Rest stops based on driving hours (assume 55 mph average)
        # 11 hours driving = ~605 miles, 14 hour window = ~770 miles
        avg_speed = 55
        driving_miles = 0
        
        while driving_miles + 605 < total_distance:
            driving_miles += 605
            
            RequiredStop.objects.create(
                route=route,
                type=RequiredStopType.REST_10HR,
                location={},  # TODO: Will find actual rest area via Mapbox
                duration_minutes=10 * 60,  # 10 hours
                miles_from_start=driving_miles,
                reason='10-hour rest required after 11 hours driving'
            )
        
        # 30-minute break stops (every 8 hours = ~440 miles)
        driving_miles = 0
        while driving_miles + 440 < total_distance:
            driving_miles += 440
            
            RequiredStop.objects.create(
                route=route,
                type=RequiredStopType.BREAK_30,
                location={},  # TODO: Will find rest area
                duration_minutes=30,
                miles_from_start=driving_miles,
                reason='30-minute break required after 8 hours driving'
            )

