import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  RefreshCw,
  Warehouse,
  Truck,
  Sprout,
  Package,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton, { CardSkeleton } from '../components/ui/Skeleton';

import farmService from '../services/farmService';
import truckService from '../services/truckService';
import warehouseService from '../services/warehouseService';
import urgencyService from '../services/urgencyService';
import transportPlanService from '../services/transportPlanService';
import { useToast } from '../context/ToastContext';
import { formatWeight, formatDistance } from '../utils/formatters';

const URGENCY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

const PLAN_STATUS_COLORS = {
  PLANNED: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#22c55e',
  CANCELLED: '#71717a',
};

// Dark Recharts Custom Tooltip
function CustomDarkTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-zinc-950/95 border border-zinc-800 shadow-2xl font-mono text-xs space-y-1">
        {label && <p className="font-semibold text-white mb-1.5">{label}</p>}
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
            {entry.name}: <span className="font-bold text-white">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function Analytics() {
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [urgencyList, setUrgencyList] = useState([]);
  const [transportPlans, setTransportPlans] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fData, tData, wData, uData, pData] = await Promise.all([
        farmService.getAllFarms().catch(() => []),
        truckService.getAllTrucks().catch(() => []),
        warehouseService.getAllWarehouses().catch(() => []),
        urgencyService.getAllFarmsUrgency().catch(() => []),
        transportPlanService.getAllTransportPlans().catch(() => []),
      ]);

      setFarms(fData);
      setTrucks(tData);
      setWarehouses(wData);
      setUrgencyList(uData);
      setTransportPlans(pData);
    } catch (err) {
      error(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Urgency Distribution Data
  const urgencyChartData = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    urgencyList.forEach((u) => {
      const level = u.urgencyLevel || 'LOW';
      counts[level] = (counts[level] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: URGENCY_COLORS[name] || '#22c55e',
    }));
  }, [urgencyList]);

  // 2. Warehouse Capacity vs Storage Used Data
  const warehouseChartData = useMemo(() => {
    return warehouses.map((w) => {
      const capacity = Number(w.capacity) || 0;
      const available = Number(w.availableStorage) || 0;
      const used = Math.max(0, capacity - available);
      return {
        name: w.name,
        Total: capacity,
        Used: used,
        Available: available,
      };
    });
  }, [warehouses]);

  // 3. Produce Quantity by Crop Type Data
  const cropTypeData = useMemo(() => {
    const map = new Map();
    farms.forEach((f) => {
      const type = f.productType || 'Other';
      const qty = Number(f.quantity) || 0;
      map.set(type, (map.get(type) || 0) + qty);
    });

    return Array.from(map.entries()).map(([name, quantity]) => ({
      name,
      quantity,
    }));
  }, [farms]);

  // 4. Transport Plan Status Breakdown Data
  const planStatusData = useMemo(() => {
    const counts = { PLANNED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
    transportPlans.forEach((p) => {
      const status = p.status || 'PLANNED';
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: status,
      count,
      color: PLAN_STATUS_COLORS[status] || '#22c55e',
    }));
  }, [transportPlans]);

  // Aggregate Metrics
  const totalProduceVolume = farms.reduce((acc, f) => acc + (Number(f.quantity) || 0), 0);
  const totalFleetCapacity = trucks.reduce((acc, t) => acc + (Number(t.capacity) || 0), 0);
  const totalPlanDistance = transportPlans.reduce(
    (acc, p) => acc + (Number(p.route?.totalDistance) || 0),
    0
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Logistics Operational Analytics" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="Logistics Operational Analytics"
        subtitle="Real-time statistical breakdown of produce perishability, warehouse storage load, and fleet capacity."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchData}>
            Refresh Analytics
          </Button>
        }
      />

      {/* KPI Stats Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <Card className="p-4">
          <span className="text-xs text-zinc-500 uppercase block">Total System Produce</span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {formatWeight(totalProduceVolume)}
          </span>
          <span className="text-[10px] text-zinc-500">Across {farms.length} farm batches</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-zinc-500 uppercase block">Total Fleet Capacity</span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">
            {formatWeight(totalFleetCapacity)}
          </span>
          <span className="text-[10px] text-zinc-500">Across {trucks.length} commercial trucks</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-zinc-500 uppercase block">Planned Route Distance</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            {formatDistance(totalPlanDistance)}
          </span>
          <span className="text-[10px] text-zinc-500">Across all transport plans</span>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Perishability & Urgency Distribution */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-4 border-b-0">
            <div>
              <CardTitle>
                <PieIcon className="w-4 h-4 text-red-400" />
                Produce Shelf-Life Urgency Distribution
              </CardTitle>
              <CardDescription>Breakdown of perishable batches by urgency grade.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={urgencyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {urgencyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomDarkTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-xs text-zinc-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Warehouse Storage Capacity vs Utilization */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-4 border-b-0">
            <div>
              <CardTitle>
                <Warehouse className="w-4 h-4 text-blue-400" />
                Warehouse Storage Allocation (kg)
              </CardTitle>
              <CardDescription>Total capacity vs used storage space per facility.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomDarkTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-xs text-zinc-400">{value}</span>}
                />
                <Bar dataKey="Used" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Total" fill="#27272a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Produce Quantity by Crop Category */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-4 border-b-0">
            <div>
              <CardTitle>
                <Sprout className="w-4 h-4 text-emerald-400" />
                Produce Volume by Category (kg)
              </CardTitle>
              <CardDescription>Aggregated produce volume awaiting logistics dispatch.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomDarkTooltip />} />
                <Bar dataKey="quantity" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Transport Plan Lifecycle Statuses */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-4 border-b-0">
            <div>
              <CardTitle>
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Transport Plan Dispatch Statuses
              </CardTitle>
              <CardDescription>Number of transport plans by state machine lifecycle.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomDarkTooltip />} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                  {planStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;
