import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { formatWeight, formatDistance } from '../../utils/formatters';

function createNumberedIcon(number, color = '#22c55e', size = 30) {
  return L.divIcon({
    className: 'custom-route-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000;
        font-weight: 800;
        font-size: 12px;
        box-shadow: 0 0 20px ${color};
      ">
        ${number}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function RouteMap({
  truck,
  warehouse,
  farms = [],
  pickupSequence = [], // array of farm IDs or farm objects in order
  legs = [],
  totalDistance,
  totalLoad,
  height = '480px',
  className = '',
}) {
  // Ordered sequence of waypoints: Depot -> Farm Stops -> Warehouse
  const waypoints = useMemo(() => {
    const points = [];

    // 1. Truck start
    if (truck?.currentLocation?.latitude && truck?.currentLocation?.longitude) {
      points.push({
        type: 'DEPOT',
        label: 'Start Depot',
        name: truck.name || 'Truck Depot',
        lat: truck.currentLocation.latitude,
        lng: truck.currentLocation.longitude,
        badge: 'D',
        color: '#f59e0b',
      });
    }

    // 2. Ordered Farm Stops
    const farmLookup = new Map();
    farms.forEach((f) => {
      const id = f._id ? f._id.toString() : f.farmId || f.id;
      farmLookup.set(id, f);
    });

    pickupSequence.forEach((item, index) => {
      const fId = typeof item === 'string' ? item : item.farmId || item._id;
      const farmDoc = farmLookup.get(fId) || (typeof item === 'object' ? item : null);
      if (farmDoc?.location?.latitude && farmDoc?.location?.longitude) {
        points.push({
          type: 'FARM',
          label: `Stop ${index + 1}`,
          name: farmDoc.name || `Farm ${index + 1}`,
          produce: farmDoc.productName || farmDoc.productType,
          quantity: farmDoc.quantity,
          lat: farmDoc.location.latitude,
          lng: farmDoc.location.longitude,
          badge: `${index + 1}`,
          color: '#22c55e',
        });
      }
    });

    // 3. Target Warehouse
    if (warehouse?.location?.latitude && warehouse?.location?.longitude) {
      points.push({
        type: 'WAREHOUSE',
        label: 'Destination',
        name: warehouse.name || 'Warehouse Central',
        lat: warehouse.location.latitude,
        lng: warehouse.location.longitude,
        badge: 'W',
        color: '#3b82f6',
      });
    }

    return points;
  }, [truck, warehouse, farms, pickupSequence]);

  const polylinePositions = useMemo(() => {
    return waypoints.map((p) => [p.lat, p.lng]);
  }, [waypoints]);

  const defaultCenter = polylinePositions.length > 0 ? polylinePositions[0] : [20.5937, 78.9629];

  return (
    <div
      style={{ height }}
      className={`w-full rounded-2xl overflow-hidden border border-zinc-850 shadow-2xl relative ${className}`}
    >
      <MapContainer
        center={defaultCenter}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full dark-tiles"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Route Line */}
        {polylinePositions.length >= 2 && (
          <>
            {/* Outer glow line */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: '#22c55e',
                weight: 6,
                opacity: 0.35,
              }}
            />
            {/* Main high-contrast route path */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: '#22c55e',
                weight: 3.5,
                opacity: 0.95,
              }}
            />
          </>
        )}

        {/* Waypoint Markers */}
        {waypoints.map((wp, idx) => (
          <Marker
            key={`${wp.type}-${idx}`}
            position={[wp.lat, wp.lng]}
            icon={createNumberedIcon(wp.badge, wp.color, 32)}
          >
            <Popup>
              <div className="space-y-1 text-xs font-sans">
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {wp.label}
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">{wp.type}</span>
                </div>
                <h4 className="font-bold text-sm text-white">{wp.name}</h4>
                {wp.produce && (
                  <p className="text-zinc-300">
                    Produce: <span className="text-emerald-400">{wp.produce}</span>
                  </p>
                )}
                {wp.quantity && (
                  <p className="text-zinc-300">
                    Quantity: <span className="font-mono text-zinc-100">{formatWeight(wp.quantity)}</span>
                  </p>
                )}
                <p className="text-zinc-500 text-[10px] font-mono">
                  {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Route Metric Badge */}
      <div className="absolute top-4 right-4 z-[1000] bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-xl p-3.5 shadow-2xl text-xs font-mono space-y-1.5">
        <div className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">
          Active Route Metrics
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Distance:</span>
          <span className="text-emerald-400 font-bold">{formatDistance(totalDistance)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Cargo Load:</span>
          <span className="text-white font-bold">{formatWeight(totalLoad)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Total Stops:</span>
          <span className="text-white font-bold">{waypoints.length}</span>
        </div>
      </div>
    </div>
  );
}

export default RouteMap;
