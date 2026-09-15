import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  Route,
  RefreshCw,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Skeleton, { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Drawer from '../components/ui/Drawer';

import urgencyService from '../services/urgencyService';
import farmService from '../services/farmService';
import { useToast } from '../context/ToastContext';
import { formatWeight, formatShelfLife, formatDate, truncateId } from '../utils/formatters';
import { getUrgencyConfig } from '../utils/statusColors';

export function Shipments() {
  const navigate = useNavigate();
  const { error } = useToast();
  const [urgencyItems, setUrgencyItems] = useState([]);
  const [farmsMap, setFarmsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [inspectingItem, setInspectingItem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uList, farms] = await Promise.all([
        urgencyService.getAllFarmsUrgency().catch(() => []),
        farmService.getAllFarms().catch(() => []),
      ]);

      const fMap = new Map();
      farms.forEach((f) => {
        const id = f._id ? f._id.toString() : f.id;
        fMap.set(id, f);
      });

      setUrgencyItems(uList);
      setFarmsMap(fMap);
    } catch (err) {
      error(err.message || 'Failed to load shipment priority queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return urgencyItems.filter((item) => {
      const farmDoc = farmsMap.get(item.farmId);
      const matchesSearch =
        item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmDoc?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmId?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel = selectedLevel === 'ALL' || item.urgencyLevel === selectedLevel;

      return matchesSearch && matchesLevel;
    });
  }, [urgencyItems, farmsMap, searchQuery, selectedLevel]);

  // Urgency Counts
  const criticalCount = urgencyItems.filter((i) => i.urgencyLevel === 'CRITICAL').length;
  const highCount = urgencyItems.filter((i) => i.urgencyLevel === 'HIGH').length;
  const mediumCount = urgencyItems.filter((i) => i.urgencyLevel === 'MEDIUM').length;
  const lowCount = urgencyItems.filter((i) => i.urgencyLevel === 'LOW').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="Produce Shipments & Urgency Queue"
        subtitle="Real-time perishable produce prioritization queue computed using remaining shelf life percentages."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchData}>
            Refresh Queue
          </Button>
        }
      />

      {/* Perishability Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between text-xs text-red-400 font-semibold mb-1">
            <span>Critical Perishability</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">{criticalCount}</div>
          <span className="text-[10px] text-zinc-500 font-mono">&le; 20% Shelf Life Left</span>
        </Card>

        <Card className="p-4 border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center justify-between text-xs text-orange-400 font-semibold mb-1">
            <span>High Urgency</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400">{highCount}</div>
          <span className="text-[10px] text-zinc-500 font-mono">&le; 40% Shelf Life Left</span>
        </Card>

        <Card className="p-4 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
            <span>Medium Urgency</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{mediumCount}</div>
          <span className="text-[10px] text-zinc-500 font-mono">&le; 70% Shelf Life Left</span>
        </Card>

        <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
            <span>Low / Stable</span>
            <Package className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{lowCount}</div>
          <span className="text-[10px] text-zinc-500 font-mono">&gt; 70% Shelf Life Left</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            icon={Search}
            placeholder="Search by produce name, farm, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          >
            <option value="ALL" className="bg-zinc-950">All Urgency Tiers</option>
            <option value="CRITICAL" className="bg-zinc-950">CRITICAL Priority</option>
            <option value="HIGH" className="bg-zinc-950">HIGH Priority</option>
            <option value="MEDIUM" className="bg-zinc-950">MEDIUM Priority</option>
            <option value="LOW" className="bg-zinc-950">LOW Priority</option>
          </select>
        </div>
      </Card>

      {/* Shipments Priority Queue Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No produce batches in queue"
          description="Register farms to calculate urgency rankings."
          actionLabel="Register Farm"
          onAction={() => navigate('/farms')}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produce Batch</TableHead>
              <TableHead>Source Farm</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Remaining Shelf Life</TableHead>
              <TableHead>Urgency Score</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item, idx) => {
              const farmDoc = farmsMap.get(item.farmId);
              const urgencyLevel = item.urgencyLevel || 'LOW';

              return (
                <TableRow
                  key={idx}
                  isClickable
                  onClick={() => setInspectingItem({ ...item, farm: farmDoc })}
                >
                  <TableCell className="font-semibold text-white">
                    <div>{item.productName}</div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Batch #{truncateId(item.farmId)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-zinc-200 font-medium">{farmDoc?.name || 'Farm Source'}</span>
                    <span className="text-xs text-zinc-500 block">{farmDoc?.productType || 'Agriculture'}</span>
                  </TableCell>

                  <TableCell className="font-mono text-white font-semibold">
                    {formatWeight(item.quantity)}
                  </TableCell>

                  <TableCell className="font-mono">
                    <span className="text-zinc-200">{formatShelfLife(item.remainingShelfLife)}</span>
                    <span className="text-[10px] text-zinc-500 block">
                      ({item.remainingPercentage?.toFixed(1)}% remaining)
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge variant={urgencyLevel.toLowerCase()} dot>
                      {item.urgencyScore} • {urgencyLevel}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="brandSubtle"
                      size="sm"
                      icon={Route}
                      onClick={() => navigate('/routes')}
                    >
                      Route Plan
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Shipment / Batch Details Drawer */}
      <Drawer
        isOpen={Boolean(inspectingItem)}
        onClose={() => setInspectingItem(null)}
        title={`Batch: ${inspectingItem?.productName}`}
        subtitle={`Farm ID: ${inspectingItem?.farmId}`}
        footer={
          <div className="flex items-center gap-3">
            <Button
              variant="brand"
              size="sm"
              icon={Route}
              onClick={() => {
                navigate('/routes');
                setInspectingItem(null);
              }}
            >
              Optimize Pickup Route
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInspectingItem(null)}>
              Close
            </Button>
          </div>
        }
      >
        {inspectingItem && (
          <div className="space-y-6 text-sm">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-3">
              <h4 className="text-xs font-semibold uppercase text-zinc-400 font-mono tracking-wider">
                Urgency Computation Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-zinc-500 block">Urgency Score</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {inspectingItem.urgencyScore} / 100
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Urgency Level</span>
                  <Badge variant={inspectingItem.urgencyLevel?.toLowerCase()} dot>
                    {inspectingItem.urgencyLevel}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Remaining Hours</span>
                  <span className="text-sm font-mono text-zinc-200">
                    {formatShelfLife(inspectingItem.remainingShelfLife)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Remaining Percentage</span>
                  <span className="text-sm font-mono text-zinc-200">
                    {inspectingItem.remainingPercentage?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {inspectingItem.farm && (
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-3">
                <h4 className="text-xs font-semibold uppercase text-zinc-400 font-mono tracking-wider">
                  Source Farm Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Farm Name:</span>
                    <span className="font-semibold text-white">{inspectingItem.farm.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Harvest Date:</span>
                    <span className="font-mono text-zinc-200">
                      {formatDate(inspectingItem.farm.harvestTime, 'standard')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Quantity:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatWeight(inspectingItem.farm.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default Shipments;
