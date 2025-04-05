import { Location, Vehicle, Delivery } from './types';

export const locations: Location[] = [
  {
    id: 'wh1',
    name: 'Central Warehouse',
    type: 'warehouse',
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: 'wh2',
    name: 'East Warehouse',
    type: 'warehouse',
    lat: 40.7589,
    lng: -73.9851
  },
  {
    id: 'dest1',
    name: 'Downtown Mall',
    type: 'destination',
    lat: 40.7505,
    lng: -73.9934
  },
  {
    id: 'dest2',
    name: 'Business District',
    type: 'destination',
    lat: 40.7527,
    lng: -73.9772
  }
];

export const vehicles: Vehicle[] = [
  {
    id: 'v1',
    warehouseId: 'wh1',
    fuelCapacity: 100,
    currentFuel: 85,
    status: 'available'
  },
  {
    id: 'v2',
    warehouseId: 'wh1',
    fuelCapacity: 100,
    currentFuel: 92,
    status: 'en-route'
  },
  {
    id: 'v3',
    warehouseId: 'wh2',
    fuelCapacity: 100,
    currentFuel: 78,
    status: 'available'
  }
];

export const deliveries: Delivery[] = [
  {
    id: 'd1',
    pickupLocation: 'wh1',
    dropoffLocation: 'dest1',
    status: 'in-transit',
    assignedVehicle: 'v2',
    estimatedTime: 45
  },
  {
    id: 'd2',
    pickupLocation: 'wh2',
    dropoffLocation: 'dest2',
    status: 'pending'
  }
];