export interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'destination';
  lat: number;
  lng: number;
}

export interface Vehicle {
  id: string;
  warehouseId: string;
  fuelCapacity: number;
  currentFuel: number;
  status: 'available' | 'en-route' | 'maintenance';
}

export interface Delivery {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered';
  assignedVehicle?: string;
  estimatedTime?: number;
}

export interface DeliveryUpdate {
  deliveryId: string;
  status: Delivery['status'];
  vehicleId?: string;
}