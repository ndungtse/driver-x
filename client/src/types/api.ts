export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: any;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    driver: {
      id: number;
      role: string;
      license_number: string;
      cdl_number: string;
      home_terminal: string;
      carrier_name: string;
      carrier_address: string;
      signature: string;
      phone_number: string;
    } | null;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  license_number?: string;
  cdl_number?: string;
  home_terminal?: string;
  carrier_name?: string;
  carrier_address?: string;
  phone_number?: string;
}

export interface TripCreateData {
  current_location: Location;
  pickup_location: Location;
  dropoff_location: Location;
  current_cycle_hours: number;
}

export interface ActivityCreateData {
  status: ActivityStatus;
  start_time: string;
  end_time: string;
  location: Location;
  remark: string;
  miles_driven?: number;
}

import { ActivityStatus, Location } from './models';

