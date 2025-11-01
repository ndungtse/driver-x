import requests
from django.conf import settings


class DistanceCalculator:
    """
    Calculates distance between two locations using Google Directions API.
    """
    
    @staticmethod
    def _format_location(location):
        """
        Format location dict to string for Google Directions API.
        
        Args:
            location: dict with address, latitude, longitude, etc.
            
        Returns:
            String address or lat,lng format, or None if invalid
        """
        if not location:
            return None
        
        # Prefer formatted address
        if location.get('address'):
            return location['address']
        
        # Fall back to lat,lng
        if location.get('latitude') is not None and location.get('longitude') is not None:
            return f"{location['latitude']},{location['longitude']}"
        
        return None
    
    @staticmethod
    def calculate_distance(start_location, end_location):
        """
        Calculate distance in miles between two locations using Google Directions API.
        
        Args:
            start_location: dict with address or lat/lng
            end_location: dict with address or lat/lng
            
        Returns:
            float: Distance in miles, or None if calculation fails
        """
        api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', '')
        if not api_key:
            return None
        
        origin = DistanceCalculator._format_location(start_location)
        destination = DistanceCalculator._format_location(end_location)
        
        if not origin or not destination:
            return None
        
        url = 'https://maps.googleapis.com/maps/api/directions/json'
        params = {
            'origin': origin,
            'destination': destination,
            'key': api_key,
            'units': 'imperial',  # Get results in miles
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('status') != 'OK' or not data.get('routes'):
                return None
            
            route = data['routes'][0]
            
            # Sum distance from all legs
            total_distance_meters = 0
            for leg in route.get('legs', []):
                if leg.get('distance', {}).get('value'):
                    total_distance_meters += leg['distance']['value']
            
            # Convert meters to miles
            distance_miles = total_distance_meters / 1609.34
            
            return distance_miles
            
        except (requests.RequestException, KeyError, ValueError, TypeError):
            return None

