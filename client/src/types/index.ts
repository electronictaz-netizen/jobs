export interface Job {
  id?: number;
  pickupDate: string;
  pickupTime: string;
  flightNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  driverId?: number | null;
  driverName?: string;
  numberOfPassengers: number;
  driverPickedUpAt?: string | null;
  driverDroppedOffAt?: string | null;
  status: 'Assigned' | 'Unassigned';
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

export interface Location {
  id?: number;
  name: string;
  address: string;
  type: 'airport' | 'hotel' | 'other';
}