import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  Route,
  ArrowRight,
  RefreshCw,
  Plus,
  Truck,
  Warehouse,
  CheckCircle2,
  Clock,
  Ban,
  Activity,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Skeleton, { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

import transportPlanService from '../services/transportPlanService';
import truckService from '../services/truckService';
import warehouseService from '../services/warehouseService';
import { useToast } from '../context/ToastContext';
import { formatWeight, formatDistance, formatDate, truncateId } from '../utils/formatters';
import { getTransportPlanStatusConfig } from '../utils/statusColors';

export function TransportPlans() {
  const navigate = useNavigate();
  const { error } = useToast();
  const [plans, setPlans] = useState([]);
  const [trucksMap, setTrucksMap] = useState(new Map());
  const [warehousesMap, setWarehousesMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const [plansData, trucksData, warehousesData] = await Promise.all([
        transportPlanService.getAllTransportPlans().catch(() => []),
        truckService.getAllTrucks().catch(() => []),
        warehouseService.getAllWarehouses().catch(() => []),
      ]);

      const tMap = new Map();
      trucksData.forEach((t) => tMap.set(t._id || t.id, t));

      const wMap = new Map();
      warehousesData.forEach((w) => wMap.set(w._id || w.id, w));

      setPlans(plansData || []);
      setTrucksMap(tMap);
      setWarehousesMap(wMap);
    } catch (err) {
      error(err.message || 'Failed to load transport plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const planId = String(plan._id || plan.id || '');
      const truck = trucksMap.get(plan.truckId);
      const wh = warehousesMap.get(plan.warehouseId);

      const matchesSearch =
        planId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        truck?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wh?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || plan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [plans, trucksMap, warehousesMap, searchQuery, statusFilter]);

  // Status counts
  const plannedCount = plans.filter((p) => p.status === 'PLANNED').length;
  const inProgressCount = plans.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'IN TRANSIT').length;
  const completedCount = plans.filter((p) => p.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="Transport Plans"
        subtitle="Manage end-to-end dispatch itineraries, route state progression, and cargo shipments."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchPlans}>
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/routes')}
            >
              Generate New Plan
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
            <span>Planned / Queued</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{plannedCount}</div>
          <span className="text-[10px] text-zinc-500 font-mono">Awaiting dispatch</span>
        </Card>

        <Card className="p-4 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center justify-between text-xs text-blue-400 font-semibold mb-1">
            <span>In Transit</span>
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">{inProgressCount}</div>
          <span className="text-[10px] text-zinc-500 font-mono">En route to warehouse</span>
        </Card>

        <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
            <span>Completed Shipments</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{completedCount}</div>
          <span className="text-[10px] text-zinc-500 font-mono">Successfully delivered</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            icon={Search}
            placeholder="Search by plan ID, vehicle, or warehouse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          >
            <option value="ALL" className="bg-zinc-950">All Lifecycle Statuses</option>
            <option value="PLANNED" className="bg-zinc-950">PLANNED</option>
            <option value="IN_PROGRESS" className="bg-zinc-950">IN_PROGRESS (In Transit)</option>
            <option value="COMPLETED" className="bg-zinc-950">COMPLETED</option>
            <option value="CANCELLED" className="bg-zinc-950">CANCELLED</option>
          </select>
        </div>
      </Card>

      {/* Transport Plans Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : filteredPlans.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No transport plans found"
          description="Generate optimized route plans via the Route Optimizer or Process Engine."
          actionLabel="Create Route Plan"
          onAction={() => navigate('/routes')}
          actionIcon={Plus}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan ID</TableHead>
              <TableHead>Assigned Vehicle</TableHead>
              <TableHead>Destination Hub</TableHead>
              <TableHead>Farms & Cargo</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlans.map((plan) => {
              const truck = trucksMap.get(plan.truckId);
              const wh = warehousesMap.get(plan.warehouseId);
              const statusCfg = getTransportPlanStatusConfig(plan.status);

              return (
                <TableRow
                  key={plan._id || plan.id}
                  isClickable
                  onClick={() => navigate(`/transport-plans/${plan._id || plan.id}`)}
                >
                  <TableCell className="font-mono font-bold text-white">
                    #{truncateId(plan._id || plan.id, 'TP')}
                    <span className="text-[10px] text-zinc-500 block font-normal">
                      {formatDate(plan.createdAt, 'relative')}
                    </span>
                  </TableCell>

                  <TableCell className="text-zinc-200 font-medium">
                    <div>{truck?.name || 'Assigned Fleet'}</div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Cap: {formatWeight(truck?.capacity)}
                    </span>
                  </TableCell>

                  <TableCell className="text-zinc-200">
                    <div>{wh?.name || 'Warehouse Central'}</div>
                  </TableCell>

                  <TableCell className="font-mono text-zinc-300">
                    <span className="text-white font-semibold">{formatWeight(plan.totalLoad)}</span>
                    <span className="text-xs text-zinc-500 block">
                      {plan.farms?.length || 0} farm stops
                    </span>
                  </TableCell>

                  <TableCell className="font-mono text-emerald-400 font-semibold">
                    {formatDistance(plan.route?.totalDistance)}
                  </TableCell>

                  <TableCell>
                    <Badge variant={statusCfg.label === 'In Transit' ? 'info' : statusCfg.label === 'Completed' ? 'success' : statusCfg.label === 'Cancelled' ? 'neutral' : 'warning'} dot>
                      {plan.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Link
                      to={`/transport-plans/${plan._id || plan.id}`}
                      className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default TransportPlans;
