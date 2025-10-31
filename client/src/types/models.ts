export type ActivityStatus = 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty_not_driving';
export type TripStatus = 'planning' | 'in_progress' | 'completed';
export type DriverRole = 'driver' | 'admin';

export interface Location {
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Driver {
  id: number;
  role: DriverRole;
  license_number: string;
  cdl_number: string;
  home_terminal: string;
  carrier_name: string;
  carrier_address: string;
  signature: string;
  phone_number: string;
  user: User;
}

export interface Trip {
  id: number;
  driver: number;
  status: TripStatus;
  current_location: Location;
  pickup_location: Location;
  dropoff_location: Location;
  current_cycle_hours: number;
  total_distance: number;
  estimated_duration: number;
  start_datetime: string | null;
  end_datetime: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  status: ActivityStatus;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location: Location;
  end_location?: Location;
  remark: string;
  miles_driven?: number | null;
  sequence: number;
}

export interface DailyLog {
  id: number;
  trip: number;
  date: string;
  driver_name: string;
  driver_signature: string;
  co_driver_name: string;
  home_terminal: string;
  carrier_name: string;
  tractor_number: string;
  trailer_numbers: string[];
  shipper: string;
  commodity: string;
  shipping_doc_numbers: string[];
  total_miles_driven: number;
  total_truck_mileage: number;
  off_duty_hours: number;
  sleeper_berth_hours: number;
  driving_hours: number;
  on_duty_not_driving_hours: number;
  activities?: Activity[];
}

export interface Route {
  id: number;
  trip: number;
  waypoints: Location[];
  total_distance: number;
  estimated_time: number;
  stops?: RequiredStop[];
}

export interface RequiredStop {
  id: number;
  type: 'fuel' | '30min_break' | '10hr_rest' | 'pickup' | 'dropoff';
  location: Location;
  duration_minutes: number;
  miles_from_start: number;
  reason: string;
}

export interface HOSCompliance {
  compliant: boolean;
  violations: Array<{
    violated: boolean;
    message: string;
    severity: 'error' | 'warning';
    rule: string;
    suggestion?: string;
  }>;
  warnings: Array<{
    violated: boolean;
    message: string;
    severity: 'warning';
    rule: string;
  }>;
}

