import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { formatWeight, formatShelfLife } from '../../utils/formatters';

// Custom SVG DivIcon helper
function createCustomIcon(color, text = '', size = 28) {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid #000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: bold;
        font-size: 11px;
        box-shadow: 0 0 15px ${color};
      ">
        ${text}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function LogisticsMap({
  farms = [],
  warehouses = [],
  trucks = [],
  roads = [],
  center = [20.5937, 78.9629], // Default India / Global fallback
  zoom = 6,
  height = '420px',
  className = '',
}) {
  // Compute center dynamically if entities exist
  const mapCenter = useMemo(() => {
    if (farms.length > 0 && farms[0]?.location?.latitude) {
      return [farms[0].location.latitude, farms[0].location.longitude];
    }
    if (warehouses.length > 0 && warehouses[0]?.location?.latitude) {
      return [warehouses[0].location.latitude, warehouses[0].location.longitude];
    }
    return center;
  }, [farms, warehouses, center]);

  return (
    <div
      style={{ height }}
      className={`w-full rounded-2xl overflow-hidden border border-zinc-850 shadow-2xl relative ${className}`}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full dark-tiles"
      >
        {/* Dark Matter / OpenStreetMap CartoDB Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Render Road Network Edges */}
        {roads.map((road) => {
          if (
            road.startLocation?.latitude &&
            road.startLocation?.longitude &&
            road.endLocation?.latitude &&
            road.endLocation?.longitude
          ) {
            const positions = [
              [road.startLocation.latitude, road.startLocation.longitude],
              [road.endLocation.latitude, road.endLocation.longitude],
            ];
            const isClosed = road.status === 'CLOSED';
            return (
              <Polyline
                key={road._id || road.id}
                positions={positions}
                pathOptions={{
                  color: isClosed ? '#ef4444' : '#3f3f46',
                  weight: isClosed ? 2 : 2.5,
                  dashArray: isClosed ? '5, 5' : undefined,
                  opacity: 0.7,
                }}
              >
                <Popup>
                  <div className="font-sans space-y-1">
                    <p className="font-semibold text-white">{road.name}</p>
                    <p className="text-xs text-zinc-400">Distance: {road.distance} km</p>
                    <p className="text-xs text-zinc-400">Status: <span className={isClosed ? 'text-red-400' : 'text-emerald-400'}>{road.status}</span></p>
                  </div>
                </Popup>
              </Polyline>
            );
          }
          return null;
        })}

        {/* Render Farms */}
        {farms.map((farm) => {
          if (farm.location?.latitude && farm.location?.longitude) {
            const isUrgent = (farm.shelfLife || 24) <= 12;
            const icon = createCustomIcon(isUrgent ? '#ef4444' : '#22c55e', '🌾');

            return (
              <Marker
                key={farm._id || farm.id}
                position={[farm.location.latitude, farm.location.longitude]}
                icon={icon}
              >
                <Popup>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-sm text-white">{farm.name}</h4>
                    <p className="text-zinc-300">
                      Produce: <span className="text-emerald-400 font-semibold">{farm.productName}</span> ({farm.productType})
                    </p>
                    <p className="text-zinc-300">Quantity: {formatWeight(farm.quantity)}</p>
                    <p className="text-zinc-300">Shelf Life: {formatShelfLife(farm.shelfLife)}</p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}

        {/* Render Warehouses */}
        {warehouses.map((wh) => {
          if (wh.location?.latitude && wh.location?.longitude) {
            const icon = createCustomIcon('#3b82f6', '🏭');
            return (
              <Marker
                key={wh._id || wh.id}
                position={[wh.location.latitude, wh.location.longitude]}
                icon={icon}
              >
                <Popup>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-sm text-white">{wh.name}</h4>
                    <p className="text-zinc-300">Capacity: {formatWeight(wh.capacity)}</p>
                    <p className="text-zinc-300">
                      Available: <span className="text-blue-400 font-semibold">{formatWeight(wh.availableStorage)}</span>
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}

        {/* Render Fleet/Trucks */}
        {trucks.map((t) => {
          if (t.currentLocation?.latitude && t.currentLocation?.longitude) {
            const icon = createCustomIcon('#f59e0b', '🚚');
            return (
              <Marker
                key={t._id || t.id}
                position={[t.currentLocation.latitude, t.currentLocation.longitude]}
                icon={icon}
              >
                <Popup>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-sm text-white">{t.name}</h4>
                    <p className="text-zinc-300">Capacity: {formatWeight(t.capacity)}</p>
                    <p className="text-zinc-300">Max Weight: {formatWeight(t.maxWeight)}</p>
                    <p className="text-zinc-300">
                      Status: <span className={t.available ? 'text-emerald-400' : 'text-zinc-400'}>{t.available ? 'Available' : 'Assigned'}</span>
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-lg p-2.5 text-[11px] font-mono flex items-center gap-4 text-zinc-300 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Farm
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Urgent Farm
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Warehouse
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Fleet Truck
        </div>
      </div>
    </div>
  );
}

export default LogisticsMap;
