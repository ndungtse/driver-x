from ..models import Trip, Route, RequiredStop, RequiredStopType


class RouteCalculator:
    """
    Calculates routes and required stops for trips.
    Currently a stub - Mapbox integration to be added later.
    """
    
    @staticmethod
    def calculate_route(trip):
        """
        Calculate route from trip locations using Mapbox API.
        
        Args:
            trip: Trip instance
            
        Returns:
            Route instance with calculated waypoints and distance
        """
        # TODO: Implement Mapbox Directions API integration
        # For now, create a stub route
        
        route, created = Route.objects.get_or_create(trip=trip)
        
        # Stub calculation - assume straight line distance (very rough)
        pickup = trip.pickup_location
        dropoff = trip.dropoff_location
        
        if pickup.get('latitude') and dropoff.get('latitude'):
            # Very rough distance calculation (Haversine would be better)
            lat_diff = abs(pickup.get('latitude', 0) - dropoff.get('latitude', 0))
            lng_diff = abs(pickup.get('longitude', 0) - dropoff.get('longitude', 0))
            
            # Rough approximation: 1 degree ≈ 69 miles (lat), varies by longitude
            distance_miles = ((lat_diff * 69) ** 2 + (lng_diff * 69) ** 2) ** 0.5
            
            route.total_distance = distance_miles
            route.estimated_time = distance_miles / 55  # Assume 55 mph average
        else:
            route.total_distance = 0
            route.estimated_time = 0
        
        route.waypoints = [
            trip.current_location,
            trip.pickup_location,
            trip.dropoff_location
        ]
        
        route.save()
        
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
                location={},  # TODO: Find actual fuel station via Mapbox
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
                location={},  # TODO: Find actual rest area via Mapbox
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
                location={},  # TODO: Find rest area
                duration_minutes=30,
                miles_from_start=driving_miles,
                reason='30-minute break required after 8 hours driving'
            )

