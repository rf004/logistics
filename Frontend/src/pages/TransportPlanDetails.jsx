import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ClipboardList,
  ArrowLeft,
  Truck,
  Warehouse,
  Sprout,
  Route,
  CheckCircle,
  Play,
  XCircle,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CapacityBar from '../components/ui/CapacityBar';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Skeleton from '../components/ui/Skeleton';
import RouteMap from '../components/maps/RouteMap';

import transportPlanService from '../services/transportPlanService';
import truckService from '../services/truckService';
import warehouseService from '../services/warehouseService';
import farmService from '../services/farmService';
import { useToast } from '../context/ToastContext';
import { formatWeight, formatDistance, formatDate, truncateId } from '../utils/formatters';
import { getTransportPlanStatusConfig } from '../utils/statusColors';

export function TransportPlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [plan, setPlan] = useState(null);
  const [truck, setTruck] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const planData = await transportPlanService.getTransportPlanById(id);
      setPlan(planData);

      // Fetch associated entities in parallel
      const [truckData, whData, allFarms] = await Promise.all([
        planData.truckId ? truckService.getTruckById(planData.truckId).catch(() => null) : null,
        planData.warehouseId ? warehouseService.getWarehouseById(planData.warehouseId).catch(() => null) : null,
        farmService.getAllFarms().catch(() => []),
      ]);

      setTruck(truckData);
      setWarehouse(whData);
      setFarms(allFarms);
    } catch (err) {
      error(err.message || 'Failed to fetch transport plan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const updated = await transportPlanService.updateTransportPlanStatus(id, newStatus);
      setPlan(updated);
      success(`Transport plan status updated to ${newStatus}!`);
    } catch (err) {
      error(err.message || 'Failed to update plan status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading Transport Plan..." />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Transport Plan Not Found</h3>
        <p className="text-xs text-zinc-400">The requested plan ID does not exist in the database.</p>
        <Link to="/transport-plans">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Plans
          </Button>
        </Link>
      </div>
    );
  }

  const statusCfg = getTransportPlanStatusConfig(plan.status);
  const utilization = truck?.capacity > 0 ? (plan.totalLoad / truck.capacity) * 100 : 0;
  const legs = plan.route?.legs || [];
  const pickupSequence = plan.route?.pickupSequence || plan.farms?.map((f) => f.farmId) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/transport-plans')}
            title="Back to Plans"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                TRANSPORT PLAN #{truncateId(plan._id || plan.id, 'TP')}
              </h1>
              <Badge variant={statusCfg.label === 'In Transit' ? 'info' : statusCfg.label === 'Completed' ? 'success' : statusCfg.label === 'Cancelled' ? 'neutral' : 'warning'} dot>
                {plan.status}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Created: {formatDate(plan.createdAt, 'standard')}
            </p>
          </div>
        </div>

        {/* State Machine Status Actions */}
        <div className="flex items-center gap-2">
          {plan.status === 'PLANNED' && (
            <>
              <Button
                variant="brand"
                size="sm"
                icon={Play}
                isLoading={updatingStatus}
                onClick={() => handleUpdateStatus('IN_PROGRESS')}
              >
                Start Transit
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                isLoading={updatingStatus}
                onClick={() => handleUpdateStatus('CANCELLED')}
              >
                Cancel Plan
              </Button>
            </>
          )}

          {plan.status === 'IN_PROGRESS' && (
            <>
              <Button
                variant="brand"
                size="sm"
                icon={CheckCircle}
                isLoading={updatingStatus}
                onClick={() => handleUpdateStatus('COMPLETED')}
              >
                Mark Completed
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                isLoading={updatingStatus}
                onClick={() => handleUpdateStatus('CANCELLED')}
              >
                Cancel Plan
              </Button>
            </>
          )}

          {(plan.status === 'COMPLETED' || plan.status === 'CANCELLED') && (
            <div className="text-xs font-mono text-zinc-500 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              Terminal State ({plan.status})
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <Card className="p-4">
          <span className="text-xs text-zinc-500 uppercase block">Total Cargo Load</span>
          <span className="text-xl font-bold text-white mt-1 block">
            {formatWeight(plan.totalLoad)}
          </span>
          <span className="text-[10px] text-zinc-500">
            {utilization.toFixed(1)}% of truck capacity
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-zinc-500 uppercase block">Total Distance</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">
            {formatDistance(plan.route?.totalDistance)}
          </span>
          <span className="text-[10px] text-zinc-500">Shortest Dijkstra path</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-zinc-500 uppercase block">Farm Pickup Stops</span>
          <span className="text-xl font-bold text-zinc-200 mt-1 block">
            {plan.farms?.length || 0} Stops
          </span>
          <span className="text-[10px] text-zinc-500">Prioritized sequence</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-zinc-500 uppercase block">Lifecycle Stage</span>
          <span className="text-xl font-bold text-blue-400 mt-1 block">{plan.status}</span>
          <span className="text-[10px] text-zinc-500">System validated</span>
        </Card>
      </div>

      {/* Route Map & Key Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <Card className="p-3">
            <RouteMap
              truck={truck}
              warehouse={warehouse}
              farms={farms}
              pickupSequence={pickupSequence}
              legs={legs}
              totalDistance={plan.route?.totalDistance}
              totalLoad={plan.totalLoad}
              height="440px"
            />
          </Card>
        </div>

        {/* Assigned Truck & Warehouse Cards */}
        <div className="space-y-6">
          {/* Truck Card */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-500 flex items-center gap-1.5 font-semibold">
                <Truck className="w-4 h-4 text-amber-400" /> Assigned Vehicle
              </span>
              {truck && (
                <Badge variant={truck.available ? 'success' : 'neutral'} size="sm">
                  {truck.available ? 'AVAILABLE' : 'ASSIGNED'}
                </Badge>
              )}
            </div>

            <h3 className="text-base font-bold text-white">{truck?.name || 'Vehicle Depot'}</h3>

            <div className="space-y-2 pt-2 border-t border-zinc-900 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Capacity:</span>
                <span className="text-white font-bold">{formatWeight(truck?.capacity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Current Payload:</span>
                <span className="text-emerald-400 font-bold">{formatWeight(plan.totalLoad)}</span>
              </div>
              <CapacityBar used={plan.totalLoad} total={truck?.capacity} showLabel={false} height="h-2" />
            </div>
          </Card>

          {/* Warehouse Destination Card */}
          <Card className="p-5 space-y-3">
            <span className="text-xs font-mono uppercase text-zinc-500 flex items-center gap-1.5 font-semibold">
              <Warehouse className="w-4 h-4 text-blue-400" /> Destination Facility
            </span>

            <h3 className="text-base font-bold text-white">{warehouse?.name || 'Central Hub'}</h3>

            <div className="space-y-2 pt-2 border-t border-zinc-900 text-xs font-mono text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Storage Available:</span>
                <span className="text-blue-400 font-bold">
                  {formatWeight(warehouse?.availableStorage)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Capacity:</span>
                <span>{formatWeight(warehouse?.capacity)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Sequential Pickup Stops & Farm Payload Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Clock className="w-4 h-4 text-emerald-400" />
            Scheduled Farm Pickup Sequence
          </CardTitle>
          <CardDescription>
            Optimized order of farm pickups with produce weights and perishability scores.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stop #</TableHead>
                <TableHead>Farm Name</TableHead>
                <TableHead>Produce</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Urgency Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.farms?.map((farmItem, idx) => {
                const farmDoc = farms.find((f) => (f._id || f.id) === farmItem.farmId);
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-mono font-bold text-emerald-400">
                      Stop {farmItem.pickupOrder || idx + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-white">
                      {farmDoc?.name || `Farm ID: ${truncateId(farmItem.farmId)}`}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {farmDoc?.productName || farmDoc?.productType || 'Agricultural Crop'}
                    </TableCell>
                    <TableCell className="font-mono text-white font-semibold">
                      {formatWeight(farmItem.quantity)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="medium" size="sm">
                        Score: {farmItem.urgency || 50}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Navigation Legs Table */}
      {legs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Route className="w-4 h-4 text-emerald-400" />
              Route Navigation Legs
            </CardTitle>
            <CardDescription>Segmented turn-by-turn route breakdown computed via Dijkstra.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leg #</TableHead>
                  <TableHead>Origin Node</TableHead>
                  <TableHead>Destination Node</TableHead>
                  <TableHead>Leg Distance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {legs.map((leg, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono font-bold text-white">Leg {idx + 1}</TableCell>
                    <TableCell className="font-mono text-zinc-300">{leg.from}</TableCell>
                    <TableCell className="font-mono text-zinc-300">{leg.to}</TableCell>
                    <TableCell className="font-mono text-emerald-400 font-bold">
                      {formatDistance(leg.distance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TransportPlanDetails;
