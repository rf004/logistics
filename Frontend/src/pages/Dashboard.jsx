import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  Package,
  AlertTriangle,
  Truck,
  Warehouse,
  ClipboardList,
  Route,
  ArrowRight,
  Play,
  TrendingUp,
  RefreshCw,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import CapacityBar from '../components/ui/CapacityBar';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Skeleton, { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import LogisticsMap from '../components/maps/LogisticsMap';

import farmService from '../services/farmService';
import truckService from '../services/truckService';
import warehouseService from '../services/warehouseService';
import roadService from '../services/roadService';
import urgencyService from '../services/urgencyService';
import transportPlanService from '../services/transportPlanService';
import processEngineService from '../services/processEngineService';
import { useToast } from '../context/ToastContext';
import { formatWeight, formatShelfLife, formatDate, truncateId } from '../utils/formatters';
import { getUrgencyConfig, getTransportPlanStatusConfig } from '../utils/statusColors';

export function Dashboard() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [farms, setFarms] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [roads, setRoads] = useState([]);
  const [urgencyList, setUrgencyList] = useState([]);
  const [transportPlans, setTransportPlans] = useState([]);

  const fetchData = async () => {
    try {
      const [fData, tData, wData, rData, uData, pData] = await Promise.all([
        farmService.getAllFarms().catch(() => []),
        truckService.getAllTrucks().catch(() => []),
        warehouseService.getAllWarehouses().catch(() => []),
        roadService.getAllRoads().catch(() => []),
        urgencyService.getAllFarmsUrgency().catch(() => []),
        transportPlanService.getAllTransportPlans().catch(() => []),
      ]);

      setFarms(fData);
      setTrucks(tData);
      setWarehouses(wData);
      setRoads(rData);
      setUrgencyList(uData);
      setTransportPlans(pData);
    } catch (err) {
      error(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRunEngine = async () => {
    try {
      setIsProcessing(true);
      const res = await processEngineService.processFarms();
      success(
        `Optimized logistics for ${res.data?.processedFarms || 0} farms. Generated ${res.data?.createdTransportPlans?.length || 0} transport plans.`,
        'Logistics Engine Executed'
      );
      fetchData();
    } catch (err) {
      error(err.message || 'Optimization pipeline execution failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // KPI Calculations
  const totalFarmsCount = farms.length;
  const availableTrucksCount = trucks.filter((t) => t.available).length;
  const criticalUrgencyCount = urgencyList.filter(
    (u) => u.urgencyLevel === 'CRITICAL' || u.urgencyLevel === 'HIGH'
  ).length;
  const activePlansCount = transportPlans.filter(
    (p) => p.status === 'PLANNED' || p.status === 'IN_PROGRESS'
  ).length;

  const totalWarehouseCapacity = warehouses.reduce((acc, w) => acc + (Number(w.capacity) || 0), 0);
  const totalAvailableStorage = warehouses.reduce((acc, w) => acc + (Number(w.availableStorage) || 0), 0);
  const warehouseUtilization =
    totalWarehouseCapacity > 0
      ? ((totalWarehouseCapacity - totalAvailableStorage) / totalWarehouseCapacity) * 100
      : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Agriculture Logistics"
          subtitle="Monitor farms, shipments, fleet capacity and optimized transportation."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <CardSkeleton count={2} />
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="Agriculture Logistics"
        subtitle="Monitor farms, shipments, fleet capacity and optimized transportation."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              isLoading={refreshing}
              icon={RefreshCw}
            >
              Refresh
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={handleRunEngine}
              isLoading={isProcessing}
              icon={Play}
            >
              Run Logistics Engine
            </Button>
          </>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1: Total Farms */}
        <Card className="p-4 relative overflow-hidden group hover:border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Farms</span>
            <Sprout className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {totalFarmsCount}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Registered sources</span>
        </Card>

        {/* KPI 2: Active Shipments */}
        <Card className="p-4 relative overflow-hidden group hover:border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Produce Batches</span>
            <Package className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {urgencyList.length}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Awaiting transit</span>
        </Card>

        {/* KPI 3: Urgent Batches */}
        <Card className="p-4 relative overflow-hidden group hover:border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Urgent Batches</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 tracking-tight">
            {criticalUrgencyCount}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">High perishability</span>
        </Card>

        {/* KPI 4: Available Fleet */}
        <Card className="p-4 relative overflow-hidden group hover:border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Fleet Available</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {availableTrucksCount} <span className="text-xs text-zinc-500 font-normal">/ {trucks.length}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Ready for dispatch</span>
        </Card>

        {/* KPI 5: Warehouses */}
        <Card className="p-4 relative overflow-hidden group hover:border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Warehouses</span>
            <Warehouse className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {warehouses.length}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            {warehouseUtilization.toFixed(0)}% storage used
          </span>
        </Card>

        {/* KPI 6: Active Transport Plans */}
        <Card className="p-4 relative overflow-hidden group hover:border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Active Plans</span>
            <ClipboardList className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {activePlansCount}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Dispatched / in transit</span>
        </Card>
      </div>

      {/* Geographic Logistics Map Overview */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <Route className="w-4 h-4 text-emerald-400" />
              Live Logistics Network Map
            </CardTitle>
            <CardDescription>
              Geographic topology of farms, active storage facilities, fleet vehicles, and road segments.
            </CardDescription>
          </div>
          <Link to="/routes">
            <Button variant="secondary" size="sm" icon={Route}>
              Open Route Optimizer
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-3">
          <LogisticsMap
            farms={farms}
            warehouses={warehouses}
            trucks={trucks}
            roads={roads}
            height="380px"
          />
        </CardContent>
      </Card>

      {/* Two Column Grid: Priority Queue + Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Shipment Priority Queue */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <Clock className="w-4 h-4 text-red-400" />
                Produce Priority Queue
              </CardTitle>
              <CardDescription>
                Urgency score calculated using harvest time and shelf life percentages.
              </CardDescription>
            </div>
            <Link to="/shipments">
              <span className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {urgencyList.length === 0 ? (
              <EmptyState
                title="No active produce queue"
                description="Register farms to generate real-time urgency metrics."
                actionLabel="Register Farm"
                onAction={() => navigate('/farms')}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produce</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Shelf Life Left</TableHead>
                    <TableHead>Urgency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urgencyList.slice(0, 5).map((item, idx) => {
                    const cfg = getUrgencyConfig(item.urgencyLevel);
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-white">
                          <div>{item.productName || 'Agricultural Produce'}</div>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            ID: {truncateId(item.farmId)}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono">{formatWeight(item.quantity)}</TableCell>
                        <TableCell className="font-mono text-zinc-300">
                          {formatShelfLife(item.remainingShelfLife)}
                          <span className="text-[10px] text-zinc-500 block">
                            ({item.remainingPercentage?.toFixed(0)}% remaining)
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.urgencyLevel?.toLowerCase()} dot>
                            {item.urgencyScore} • {item.urgencyLevel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Fleet Status & Utilization */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <Truck className="w-4 h-4 text-amber-400" />
                Fleet Availability & Capacity
              </CardTitle>
              <CardDescription>
                Live payload capacities and dispatch readiness for trucks.
              </CardDescription>
            </div>
            <Link to="/trucks">
              <span className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono">
                Manage Fleet <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {trucks.length === 0 ? (
              <EmptyState
                title="No trucks in fleet"
                description="Add trucks to enable capacity-aware route optimization."
                actionLabel="Add Truck"
                onAction={() => navigate('/trucks')}
              />
            ) : (
              trucks.slice(0, 4).map((t) => (
                <div
                  key={t._id || t.id}
                  className="p-3.5 rounded-xl border border-zinc-850 bg-zinc-900/30 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                      <Badge variant={t.available ? 'success' : 'neutral'} size="sm" dot>
                        {t.available ? 'Available' : 'Assigned'}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      Capacity: {formatWeight(t.capacity)} | Max Weight: {formatWeight(t.maxWeight)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-zinc-500 block">Dimensions</span>
                    <span className="text-xs font-mono text-zinc-300">
                      {t.length}m × {t.width}m × {t.height}m
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two Column Grid: Warehouse Capacity + Active Transport Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 3: Warehouse Capacity */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <Warehouse className="w-4 h-4 text-blue-400" />
                Warehouse Storage Utilization
              </CardTitle>
              <CardDescription>
                Real-time storage capacities and produce intake thresholds.
              </CardDescription>
            </div>
            <Link to="/warehouses">
              <span className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono">
                View Facilities <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-5">
            {warehouses.length === 0 ? (
              <EmptyState
                title="No warehouses registered"
                description="Add storage facilities to receive optimized agricultural shipments."
                actionLabel="Add Warehouse"
                onAction={() => navigate('/warehouses')}
              />
            ) : (
              warehouses.slice(0, 4).map((w) => {
                const used = Math.max(0, (Number(w.capacity) || 0) - (Number(w.availableStorage) || 0));
                return (
                  <div key={w._id || w.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{w.name}</span>
                      <span className="font-mono text-zinc-400">
                        {formatWeight(used)} / {formatWeight(w.capacity)}
                      </span>
                    </div>
                    <CapacityBar used={used} total={w.capacity} showLabel={false} height="h-2" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Section 4: Active Transport Plans */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                Recent Transport Plans
              </CardTitle>
              <CardDescription>
                Algorithmic transport plans generated by the process engine.
              </CardDescription>
            </div>
            <Link to="/transport-plans">
              <span className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono">
                View All Plans <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {transportPlans.length === 0 ? (
              <EmptyState
                title="No transport plans"
                description="Run the logistics engine or optimize routes to create transport plans."
                actionLabel="Create Transport Plan"
                onAction={() => navigate('/routes')}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan ID</TableHead>
                    <TableHead>Farms</TableHead>
                    <TableHead>Total Cargo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transportPlans.slice(0, 4).map((plan) => {
                    const statusCfg = getTransportPlanStatusConfig(plan.status);
                    return (
                      <TableRow
                        key={plan._id || plan.id}
                        isClickable
                        onClick={() => navigate(`/transport-plans/${plan._id || plan.id}`)}
                      >
                        <TableCell className="font-mono font-semibold text-white">
                          #{truncateId(plan._id || plan.id, 'TP')}
                        </TableCell>
                        <TableCell className="text-zinc-300 font-mono">
                          {plan.farms?.length || 0} stops
                        </TableCell>
                        <TableCell className="font-mono">{formatWeight(plan.totalLoad)}</TableCell>
                        <TableCell>
                          <Badge variant={statusCfg.label === 'In Transit' ? 'info' : statusCfg.label === 'Completed' ? 'success' : 'warning'} dot>
                            {plan.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            to={`/transport-plans/${plan._id || plan.id}`}
                            className="text-xs text-emerald-400 hover:underline font-mono inline-flex items-center gap-1"
                          >
                            Details <ArrowRight className="w-3 h-3" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
