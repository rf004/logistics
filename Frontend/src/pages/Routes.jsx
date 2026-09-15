import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Route as RouteIcon,
  Play,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Warehouse,
  Sprout,
  ArrowRight,
  RefreshCw,
  Layers,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Save,
  Check,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CapacityBar from '../components/ui/CapacityBar';
import RouteMap from '../components/maps/RouteMap';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

import farmService from '../services/farmService';
import truckService from '../services/truckService';
import warehouseService from '../services/warehouseService';
import roadService from '../services/roadService';
import urgencyService from '../services/urgencyService';
import processEngineService from '../services/processEngineService';
import transportPlanService from '../services/transportPlanService';
import { useToast } from '../context/ToastContext';
import { formatWeight, formatDistance, formatShelfLife, truncateId } from '../utils/formatters';
import { getUrgencyConfig } from '../utils/statusColors';

export function Routes() {
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  // Raw Entities
  const [farms, setFarms] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [roads, setRoads] = useState([]);
  const [urgencyMap, setUrgencyMap] = useState(new Map());

  // Multi-Step Selection State
  const [selectedFarmIds, setSelectedFarmIds] = useState(new Set());
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  // Optimization Output from Backend Process Engine
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [activeTruckAssignment, setActiveTruckAssignment] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fData, tData, wData, rData, uData] = await Promise.all([
        farmService.getAllFarms().catch(() => []),
        truckService.getAllTrucks().catch(() => []),
        warehouseService.getAllWarehouses().catch(() => []),
        roadService.getAllRoads().catch(() => []),
        urgencyService.getAllFarmsUrgency().catch(() => []),
      ]);

      setFarms(fData);
      setTrucks(tData);
      setWarehouses(wData);
      setRoads(rData);

      const uMap = new Map();
      uData.forEach((u) => uMap.set(u.farmId, u));
      setUrgencyMap(uMap);

      // Pre-select first available truck and warehouse if present
      if (tData.length > 0) setSelectedTruckId(tData[0]._id || tData[0].id);
      if (wData.length > 0) setSelectedWarehouseId(wData[0]._id || wData[0].id);
      // Select all candidate farms by default
      const initialFarmSet = new Set(fData.map((f) => f._id || f.id));
      setSelectedFarmIds(initialFarmSet);
    } catch (err) {
      error(err.message || 'Failed to initialize route optimization environment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleFarmSelection = (farmId) => {
    setSelectedFarmIds((prev) => {
      const next = new Set(prev);
      if (next.has(farmId)) {
        next.delete(farmId);
      } else {
        next.add(farmId);
      }
      return next;
    });
  };

  const handleSelectAllFarms = () => {
    if (selectedFarmIds.size === farms.length) {
      setSelectedFarmIds(new Set());
    } else {
      setSelectedFarmIds(new Set(farms.map((f) => f._id || f.id)));
    }
  };

  // Selected Truck & Warehouse objects
  const selectedTruck = useMemo(() => {
    return trucks.find((t) => (t._id || t.id) === selectedTruckId) || null;
  }, [trucks, selectedTruckId]);

  const selectedWarehouse = useMemo(() => {
    return warehouses.find((w) => (w._id || w.id) === selectedWarehouseId) || null;
  }, [warehouses, selectedWarehouseId]);

  // Execute backend optimization engine
  const handleOptimizeRoute = async () => {
    if (selectedFarmIds.size === 0) {
      warning('Please select at least one candidate farm for route optimization.');
      return;
    }

    try {
      setOptimizing(true);
      const engineResponse = await processEngineService.processFarms();
      const processData = engineResponse.data || engineResponse;

      setOptimizationResult(processData);

      // Find relevant truck assignment in the backend result
      const assignments = processData.truckAssignments || [];
      const matched =
        assignments.find((a) => a.truckId === selectedTruckId && a.optimizedRoute) ||
        assignments.find((a) => a.optimizedRoute) ||
        assignments[0];

      setActiveTruckAssignment(matched || null);

      if (matched && matched.optimizedRoute) {
        success(
          `Optimal pickup sequence generated with ${matched.optimizedRoute.legs?.length || 0} route legs!`,
          'Route Optimization Complete'
        );
      } else {
        warning(
          'Engine processed candidate farms. Some constraints (road/capacity) limited complete route generation.'
        );
      }
    } catch (err) {
      error(err.message || 'Optimization request failed on backend engine');
    } finally {
      setOptimizing(false);
    }
  };

  // Persist generated route into MongoDB as a Transport Plan
  const handleSaveAsTransportPlan = async () => {
    if (!activeTruckAssignment?.optimizedRoute) {
      warning('No valid route available to save as transport plan');
      return;
    }

    const routeData = activeTruckAssignment.optimizedRoute;
    const truckObj = selectedTruck || trucks.find((t) => (t._id || t.id) === activeTruckAssignment.truckId);
    const whObj = selectedWarehouse || warehouses[0];

    try {
      setSavingPlan(true);

      const payload = {
        truckId: activeTruckAssignment.truckId || truckObj?._id || truckObj?.id,
        warehouseId: routeData.warehouseId || whObj?._id || whObj?.id,
        farms: (routeData.pickupSequence || []).map((fId, idx) => {
          const farmDoc = farms.find((f) => (f._id || f.id) === fId);
          const uObj = urgencyMap.get(fId);
          return {
            farmId: fId,
            pickupOrder: idx + 1,
            quantity: farmDoc?.quantity || 100,
            urgency: uObj ? uObj.urgencyScore : 50,
          };
        }),
        route: {
          startNode: truckObj?.name || 'Depot',
          pickupSequence: routeData.pickupSequence || [],
          warehouseNode: whObj?.name || 'Warehouse',
          legs: routeData.legs || [],
          totalDistance: routeData.totalDistance || 0,
        },
        totalLoad: routeData.totalLoad || 0,
        status: 'PLANNED',
      };

      const created = await transportPlanService.createTransportPlan(payload);
      success(
        `Transport plan #${truncateId(created._id || created.id, 'TP')} created and registered!`,
        'Plan Persisted'
      );
      navigate(`/transport-plans/${created._id || created.id}`);
    } catch (err) {
      error(err.message || 'Failed to save transport plan to backend database');
    } finally {
      setSavingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Route Optimization & Multi-Farm Pickup"
          subtitle="Calculating road feasibility and shortest Dijkstra paths..."
        />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const activeRoute = activeTruckAssignment?.optimizedRoute;
  const legs = activeRoute?.legs || [];
  const pickupSequence = activeRoute?.pickupSequence || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="Route Optimization & Multi-Farm Pickup"
        subtitle="Algorithmic route planner combining Dijkstra shortest path, road constraint filtering, and urgency-driven multi-stop scheduling."
        actions={
          <Button
            variant="brand"
            size="md"
            icon={Play}
            onClick={handleOptimizeRoute}
            isLoading={optimizing}
          >
            Run Route Optimization
          </Button>
        }
      />

      {/* Configuration & Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Candidate Farms Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>
                <Sprout className="w-4 h-4 text-emerald-400" />
                Step 1: Select Candidate Farms ({selectedFarmIds.size} Selected)
              </CardTitle>
              <CardDescription>
                Choose agricultural pick-up locations. Urgency score and quantity will determine optimal sequence.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSelectAllFarms}>
              {selectedFarmIds.size === farms.length ? 'Deselect All' : 'Select All'}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {farms.length === 0 ? (
              <EmptyState
                title="No farms registered"
                description="Register farms first to perform route planning."
                actionLabel="Register Farm"
                onAction={() => navigate('/farms')}
              />
            ) : (
              <div className="divide-y divide-zinc-900 max-h-72 overflow-y-auto">
                {farms.map((farm) => {
                  const fId = farm._id || farm.id;
                  const isChecked = selectedFarmIds.has(fId);
                  const u = urgencyMap.get(fId);
                  const urgencyLevel = u?.urgencyLevel || 'LOW';

                  return (
                    <label
                      key={fId}
                      className={`flex items-center justify-between p-3.5 px-5 hover:bg-zinc-900/40 cursor-pointer transition-colors ${
                        isChecked ? 'bg-zinc-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFarmSelection(fId)}
                          className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-semibold text-sm text-white block">{farm.name}</span>
                          <span className="text-xs text-zinc-400">
                            {farm.productName} ({formatWeight(farm.quantity)})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={urgencyLevel.toLowerCase()} size="sm" dot>
                          {u ? `${u.urgencyScore} • ${u.urgencyLevel}` : 'Urgency Active'}
                        </Badge>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2 & 3: Truck & Warehouse Selection */}
        <div className="space-y-6">
          {/* Truck Selection */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                Step 2: Assign Truck
              </h3>
              {selectedTruck && (
                <Badge variant={selectedTruck.available ? 'success' : 'neutral'} size="sm">
                  {selectedTruck.available ? 'Available' : 'Assigned'}
                </Badge>
              )}
            </div>

            <select
              value={selectedTruckId}
              onChange={(e) => setSelectedTruckId(e.target.value)}
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
            >
              {trucks.map((t) => (
                <option key={t._id || t.id} value={t._id || t.id} className="bg-zinc-950">
                  {t.name} (Cap: {formatWeight(t.capacity)})
                </option>
              ))}
            </select>

            {selectedTruck && (
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-850 text-xs font-mono space-y-1 text-zinc-400">
                <div className="flex justify-between">
                  <span>Payload Capacity:</span>
                  <span className="text-white font-bold">{formatWeight(selectedTruck.capacity)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Weight Limit:</span>
                  <span className="text-white">{formatWeight(selectedTruck.maxWeight)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Warehouse Selection */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-blue-400" />
              Step 3: Destination Warehouse
            </h3>

            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
            >
              {warehouses.map((w) => (
                <option key={w._id || w.id} value={w._id || w.id} className="bg-zinc-950">
                  {w.name} (Free: {formatWeight(w.availableStorage)})
                </option>
              ))}
            </select>

            {selectedWarehouse && (
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-850 text-xs font-mono space-y-1 text-zinc-400">
                <div className="flex justify-between">
                  <span>Storage Available:</span>
                  <span className="text-blue-400 font-bold">{formatWeight(selectedWarehouse.availableStorage)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Capacity:</span>
                  <span className="text-white">{formatWeight(selectedWarehouse.capacity)}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Optimization Visualizer Section */}
      {activeRoute ? (
        <div className="space-y-6">
          {/* Route Overview Metric Banner */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-zinc-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Optimal Multi-Farm Route Calculated
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Processed with Dijkstra Shortest Path and Urgency Priority Queues.
              </p>
            </div>

            <div className="flex items-center gap-6 font-mono">
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase block">Total Distance</span>
                <span className="text-xl font-bold text-emerald-400">
                  {formatDistance(activeRoute.totalDistance)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase block">Total Load</span>
                <span className="text-xl font-bold text-white">
                  {formatWeight(activeRoute.totalLoad)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase block">Stops</span>
                <span className="text-xl font-bold text-zinc-200">
                  {pickupSequence.length} Farms + Hub
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={Save}
              onClick={handleSaveAsTransportPlan}
              isLoading={savingPlan}
            >
              Save as Transport Plan
            </Button>
          </div>

          {/* Map + Sequence Step Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Leaflet Map */}
            <div className="lg:col-span-2">
              <Card className="p-3">
                <RouteMap
                  truck={selectedTruck}
                  warehouse={selectedWarehouse}
                  farms={farms}
                  pickupSequence={pickupSequence}
                  legs={legs}
                  totalDistance={activeRoute.totalDistance}
                  totalLoad={activeRoute.totalLoad}
                  height="450px"
                />
              </Card>
            </div>

            {/* Sequential Pickup Stops Timeline */}
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Optimized Pickup Order
                </CardTitle>
                <CardDescription>Order calculated based on perishability score & road distance.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 max-h-[360px] overflow-y-auto">
                {/* 1. Start Depot */}
                <div className="flex items-start gap-3 relative pb-4">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                    D
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-white block">
                      {selectedTruck?.name || 'Depot'} (Start)
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">Truck Departure Station</span>
                  </div>
                </div>

                {/* 2. Farm Waypoints */}
                {pickupSequence.map((fId, index) => {
                  const farmDoc = farms.find((f) => (f._id || f.id) === fId);
                  const u = urgencyMap.get(fId);

                  return (
                    <div key={fId} className="flex items-start gap-3 relative pb-4">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold flex items-center justify-center text-xs shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-white truncate">
                            {farmDoc?.name || `Farm ${index + 1}`}
                          </span>
                          {u && (
                            <Badge variant={u.urgencyLevel?.toLowerCase()} size="sm">
                              {u.urgencyScore}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono block">
                          Produce: {farmDoc?.productName} ({formatWeight(farmDoc?.quantity)})
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* 3. Final Warehouse */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                    W
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-white block">
                      {selectedWarehouse?.name || 'Warehouse'} (Destination)
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">Final Unloading Hub</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Navigation Legs Breakdown Table */}
          {legs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <RouteIcon className="w-4 h-4 text-emerald-400" />
                  Navigation Legs & Traversed Roads
                </CardTitle>
                <CardDescription>
                  Segment-by-segment shortest path distance computed via Dijkstra.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leg #</TableHead>
                      <TableHead>From Origin</TableHead>
                      <TableHead>To Waypoint</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Roads Traversed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legs.map((leg, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono font-bold text-white">
                          Leg {idx + 1}
                        </TableCell>
                        <TableCell className="font-mono text-zinc-300">{leg.from}</TableCell>
                        <TableCell className="font-mono text-zinc-300">{leg.to}</TableCell>
                        <TableCell className="font-mono text-emerald-400 font-bold">
                          {formatDistance(leg.distance)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-500">
                          {leg.roads?.length > 0 ? leg.roads.join(', ') : 'Direct segment'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-10 text-center border-dashed border-zinc-800 bg-zinc-950/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Route Optimization Ready</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Select candidate farms, target warehouse, and truck above, then click "Run Route Optimization" to generate the sequence and map paths.
            </p>
          </div>
          <Button
            variant="brand"
            size="md"
            icon={Play}
            onClick={handleOptimizeRoute}
            isLoading={optimizing}
          >
            Run Route Optimization
          </Button>
        </Card>
      )}
    </div>
  );
}

export default Routes;
