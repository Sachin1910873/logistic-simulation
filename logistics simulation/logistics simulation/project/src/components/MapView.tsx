import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Truck, Package, Building2 } from 'lucide-react';
import type { Location, Vehicle, Delivery } from '../types';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  locations: Location[];
  vehicles: Vehicle[];
  deliveries: Delivery[];
}

const MapView: React.FC<MapViewProps> = ({ locations, vehicles, deliveries }) => {
  const center = { lat: 40.7128, lng: -74.0060 };

  const warehouseIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const destinationIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const getDeliveryRoutes = () => {
    return deliveries
      .filter(delivery => delivery.status === 'in-transit')
      .map(delivery => {
        const pickup = locations.find(l => l.id === delivery.pickupLocation);
        const dropoff = locations.find(l => l.id === delivery.dropoffLocation);
        
        if (pickup && dropoff) {
          return [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]];
        }
        return null;
      })
      .filter(route => route !== null);
  };

  return (
    <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map(location => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={location.type === 'warehouse' ? warehouseIcon : destinationIcon}
          >
            <Popup>
              <div className="flex items-center gap-2">
                {location.type === 'warehouse' ? (
                  <Building2 className="w-4 h-4" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                <span className="font-semibold">{location.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
              </div>
              {location.type === 'warehouse' && (
                <div className="mt-2">
                  <div className="text-sm font-semibold">Vehicles:</div>
                  {vehicles
                    .filter(v => v.warehouseId === location.id)
                    .map(v => (
                      <div key={v.id} className="flex items-center gap-1 text-sm">
                        <Truck className="w-3 h-3" />
                        <span>Vehicle {v.id}</span>
                        <span className="text-xs">({v.status})</span>
                      </div>
                    ))}
                </div>
              )}
            </Popup>
          </Marker>
        ))}

        {getDeliveryRoutes().map((route, index) => (
          <Polyline
            key={index}
            positions={route as [number, number][]}
            color="#2563eb"
            weight={3}
            opacity={0.7}
            dashArray="10,10"
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;