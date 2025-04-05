import React, { useState } from 'react';
import { MapPin, Truck, Package, AlertCircle } from 'lucide-react';
import { locations, vehicles as initialVehicles, deliveries as initialDeliveries } from '../data';
import type { Vehicle, Delivery, DeliveryUpdate } from '../types';
import MapView from './MapView';

const Dashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);

  const handleVehicleStatusUpdate = (vehicleId: string, status: Vehicle['status']) => {
    setVehicles(prev => prev.map(vehicle => {
      if (vehicle.id === vehicleId) {
        // If vehicle is assigned to a delivery, update delivery status accordingly
        if (status === 'maintenance') {
          const assignedDelivery = deliveries.find(d => d.assignedVehicle === vehicleId);
          if (assignedDelivery) {
            handleDeliveryUpdate({
              deliveryId: assignedDelivery.id,
              status: 'pending',
              vehicleId: undefined
            });
          }
        }
        return { ...vehicle, status };
      }
      return vehicle;
    }));
  };

  const handleFuelUpdate = (vehicleId: string, fuelAmount: number) => {
    setVehicles(prev => prev.map(vehicle => {
      if (vehicle.id === vehicleId) {
        const newFuel = Math.min(100, Math.max(0, fuelAmount));
        // If fuel is too low, automatically set vehicle to maintenance
        if (newFuel < 20 && vehicle.status !== 'maintenance') {
          handleVehicleStatusUpdate(vehicleId, 'maintenance');
        }
        return { ...vehicle, currentFuel: newFuel };
      }
      return vehicle;
    }));
  };

  const handleDeliveryUpdate = ({ deliveryId, status, vehicleId }: DeliveryUpdate) => {
    setDeliveries(prev => prev.map(delivery => {
      if (delivery.id === deliveryId) {
        // Calculate estimated time based on status
        let estimatedTime = delivery.estimatedTime;
        if (status === 'in-transit') {
          // Calculate based on distance between pickup and dropoff
          const pickup = locations.find(l => l.id === delivery.pickupLocation);
          const dropoff = locations.find(l => l.id === delivery.dropoffLocation);
          if (pickup && dropoff) {
            // Simple distance-based calculation (could be more sophisticated)
            const distance = Math.sqrt(
              Math.pow(pickup.lat - dropoff.lat, 2) + 
              Math.pow(pickup.lng - dropoff.lng, 2)
            ) * 111; // Rough conversion to kilometers
            estimatedTime = Math.round(distance * 2); // Assuming 30km/h average speed
          }
        }

        // Update assigned vehicle's status
        if (vehicleId) {
          const newVehicleStatus = status === 'in-transit' ? 'en-route' : 'available';
          handleVehicleStatusUpdate(vehicleId, newVehicleStatus);
        }

        // If delivery is completed, make vehicle available
        if (status === 'delivered' && delivery.assignedVehicle) {
          handleVehicleStatusUpdate(delivery.assignedVehicle, 'available');
        }

        return { 
          ...delivery, 
          status,
          assignedVehicle: vehicleId,
          estimatedTime
        };
      }
      return delivery;
    }));
  };

  const getAvailableVehicles = () => {
    return vehicles.filter(v => 
      v.status === 'available' && 
      v.currentFuel >= 20 && // Only show vehicles with sufficient fuel
      !deliveries.some(d => 
        d.assignedVehicle === v.id && 
        ['assigned', 'in-transit'].includes(d.status)
      )
    );
  };

  const canTransition = (delivery: Delivery, newStatus: Delivery['status']): boolean => {
    const statusOrder = ['pending', 'assigned', 'in-transit', 'delivered'];
    const currentIndex = statusOrder.indexOf(delivery.status);
    const newIndex = statusOrder.indexOf(newStatus);
    
    // Can only move one step forward or backward
    if (Math.abs(newIndex - currentIndex) > 1) return false;
    
    // Additional validation
    if (newStatus === 'in-transit' && !delivery.assignedVehicle) return false;
    if (delivery.status === 'delivered') return false; // Can't change once delivered
    
    return true;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<MapPin className="w-6 h-6" />}
          title="Locations"
          value={locations.length.toString()}
          subtitle="Active Points"
        />
        <StatCard
          icon={<Truck className="w-6 h-6" />}
          title="Vehicles"
          value={`${vehicles.filter(v => v.status === 'available').length}/${vehicles.length}`}
          subtitle="Available/Total"
        />
        <StatCard
          icon={<Package className="w-6 h-6" />}
          title="Deliveries"
          value={deliveries.filter(d => d.status !== 'delivered').length.toString()}
          subtitle="Active Deliveries"
        />
      </div>

      <div className="mb-8">
        <MapView
          locations={locations}
          vehicles={vehicles}
          deliveries={deliveries}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl border border-white/10">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Vehicle Status</h2>
            <div className="space-y-4">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="font-medium text-white">Vehicle {vehicle.id}</p>
                    <p className="text-sm text-gray-300">
                      Warehouse: {locations.find(l => l.id === vehicle.warehouseId)?.name}
                    </p>
                    {vehicle.currentFuel < 20 && (
                      <p className="text-sm text-red-400 mt-1">Low fuel warning!</p>
                    )}
                  </div>
                  <div className="text-right">
                    <select
                      value={vehicle.status}
                      onChange={(e) => handleVehicleStatusUpdate(vehicle.id, e.target.value as Vehicle['status'])}
                      className="mb-2 px-2 py-1 rounded bg-white/5 border border-white/20 text-white text-sm"
                      disabled={deliveries.some(d => 
                        d.assignedVehicle === vehicle.id && 
                        ['assigned', 'in-transit'].includes(d.status)
                      )}
                    >
                      <option value="available">Available</option>
                      <option value="en-route">En Route</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        value={vehicle.currentFuel}
                        onChange={(e) => handleFuelUpdate(vehicle.id, parseInt(e.target.value))}
                        className="w-24"
                        min="0"
                        max="100"
                        step="1"
                      />
                      <span className={`text-sm ${
                        vehicle.currentFuel < 20 ? 'text-red-400' : 
                        vehicle.currentFuel < 50 ? 'text-yellow-400' : 
                        'text-green-400'
                      }`}>
                        {vehicle.currentFuel}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl border border-white/10">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Active Deliveries</h2>
            <div className="space-y-4">
              {deliveries.map(delivery => (
                <div 
                  key={delivery.id} 
                  className={`flex items-center justify-between border-b border-white/10 pb-4 cursor-pointer transition-colors ${
                    selectedDelivery === delivery.id ? 'bg-white/5 -mx-4 px-4' : 'hover:bg-white/5'
                  }`}
                  onClick={() => setSelectedDelivery(delivery.id === selectedDelivery ? null : delivery.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">Delivery {delivery.id}</p>
                      {delivery.status === 'pending' && (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-300">
                      From: {locations.find(l => l.id === delivery.pickupLocation)?.name}
                    </p>
                    <p className="text-sm text-gray-300">
                      To: {locations.find(l => l.id === delivery.dropoffLocation)?.name}
                    </p>
                    {selectedDelivery === delivery.id && delivery.status !== 'delivered' && (
                      <div className="mt-2 space-y-2">
                        <select
                          value={delivery.assignedVehicle || ''}
                          onChange={(e) => {
                            const vehicleId = e.target.value;
                            handleDeliveryUpdate({
                              deliveryId: delivery.id,
                              status: vehicleId ? 'assigned' : 'pending',
                              vehicleId: vehicleId || undefined
                            });
                          }}
                          className="block w-full px-2 py-1 rounded bg-white/5 border border-white/20 text-white text-sm"
                          disabled={delivery.status === 'delivered'}
                        >
                          <option value="">Select Vehicle</option>
                          {getAvailableVehicles().map(v => (
                            <option key={v.id} value={v.id}>
                              Vehicle {v.id} ({v.currentFuel}% fuel)
                            </option>
                          ))}
                        </select>
                        <select
                          value={delivery.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as Delivery['status'];
                            if (canTransition(delivery, newStatus)) {
                              handleDeliveryUpdate({
                                deliveryId: delivery.id,
                                status: newStatus,
                                vehicleId: delivery.assignedVehicle
                              });
                            }
                          }}
                          className="block w-full px-2 py-1 rounded bg-white/5 border border-white/20 text-white text-sm"
                          disabled={!delivery.assignedVehicle || delivery.status === 'delivered'}
                        >
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="in-transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      delivery.status === 'delivered' ? 'text-green-400' :
                      delivery.status === 'in-transit' ? 'text-blue-400' :
                      delivery.status === 'assigned' ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                    </p>
                    {delivery.estimatedTime && (
                      <p className="text-sm text-gray-300">{delivery.estimatedTime} mins</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl border border-white/10">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-300">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;