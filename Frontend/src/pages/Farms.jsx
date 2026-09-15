import React, { useEffect, useState, useMemo } from 'react';
import {
  Sprout,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  ExternalLink,
  MapPin,
  Clock,
  Package,
  Layers,
  RefreshCw,
  AlertTriangle,
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
import Modal from '../components/ui/Modal';
import FarmModal from '../components/forms/FarmModal';

import farmService from '../services/farmService';
import urgencyService from '../services/urgencyService';
import { useToast } from '../context/ToastContext';
import { formatWeight, formatShelfLife, formatDate, truncateId } from '../utils/formatters';
import { getUrgencyConfig } from '../utils/statusColors';

export function Farms() {
  const { success, error } = useToast();
  const [farms, setFarms] = useState([]);
  const [urgencyMap, setUrgencyMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');

  // Modal & Drawer states
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [inspectingFarm, setInspectingFarm] = useState(null);
  const [deletingFarm, setDeletingFarm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFarmsAndUrgency = async () => {
    try {
      setLoading(true);
      const [farmList, urgencies] = await Promise.all([
        farmService.getAllFarms().catch(() => []),
        urgencyService.getAllFarmsUrgency().catch(() => []),
      ]);

      const map = new Map();
      urgencies.forEach((u) => {
        map.set(u.farmId, u);
      });

      setFarms(farmList);
      setUrgencyMap(map);
    } catch (err) {
      error(err.message || 'Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmsAndUrgency();
  }, []);

  // Distinct product types for filter
  const productTypes = useMemo(() => {
    const types = new Set(farms.map((f) => f.productType).filter(Boolean));
    return ['ALL', ...Array.from(types)];
  }, [farms]);

  // Filter & sort
  const filteredFarms = useMemo(() => {
    return farms
      .filter((farm) => {
        const matchesSearch =
          farm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farm.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farm.productType?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = selectedType === 'ALL' || farm.productType === selectedType;

        const u = urgencyMap.get(farm._id || farm.id);
        const matchesUrgency =
          selectedUrgency === 'ALL' || (u && u.urgencyLevel === selectedUrgency);

        return matchesSearch && matchesType && matchesUrgency;
      })
      .sort((a, b) => {
        const uA = urgencyMap.get(a._id || a.id);
        const uB = urgencyMap.get(b._id || b.id);

        if (sortBy === 'urgency') {
          return (uB?.urgencyScore || 0) - (uA?.urgencyScore || 0);
        }
        if (sortBy === 'quantity') {
          return (b.quantity || 0) - (a.quantity || 0);
        }
        if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '');
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [farms, urgencyMap, searchQuery, selectedType, selectedUrgency, sortBy]);

  const handleDeleteFarm = async () => {
    if (!deletingFarm) return;
    try {
      setIsDeleting(true);
      await farmService.deleteFarm(deletingFarm._id || deletingFarm.id);
      success(`Farm "${deletingFarm.name}" removed successfully.`);
      setDeletingFarm(null);
      fetchFarmsAndUrgency();
    } catch (err) {
      error(err.message || 'Failed to delete farm.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="Farms Management"
        subtitle="Track agricultural producers, harvest dates, produce perishability, and location coordinates."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchFarmsAndUrgency}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingFarm(null);
                setIsFarmModalOpen(true);
              }}
            >
              Register Farm
            </Button>
          </>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            icon={Search}
            placeholder="Search farm or produce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          >
            {productTypes.map((t) => (
              <option key={t} value={t} className="bg-zinc-950">
                {t === 'ALL' ? 'All Produce Types' : t}
              </option>
            ))}
          </select>

          {/* Urgency Filter */}
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          >
            <option value="ALL" className="bg-zinc-950">All Urgency Levels</option>
            <option value="CRITICAL" className="bg-zinc-950">CRITICAL (≤ 20% shelf life)</option>
            <option value="HIGH" className="bg-zinc-950">HIGH (≤ 40% shelf life)</option>
            <option value="MEDIUM" className="bg-zinc-950">MEDIUM (≤ 70% shelf life)</option>
            <option value="LOW" className="bg-zinc-950">LOW (&gt; 70% shelf life)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          >
            <option value="createdAt" className="bg-zinc-950">Sort: Newest First</option>
            <option value="urgency" className="bg-zinc-950">Sort: Highest Urgency</option>
            <option value="quantity" className="bg-zinc-950">Sort: Largest Quantity</option>
            <option value="name" className="bg-zinc-950">Sort: Farm Name (A-Z)</option>
          </select>
        </div>
      </Card>

      {/* Main Farms Data Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : filteredFarms.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No farms found"
          description="There are no farms matching the current filters or no farms have been registered yet."
          actionLabel="Register Farm"
          onAction={() => {
            setEditingFarm(null);
            setIsFarmModalOpen(true);
          }}
          actionIcon={Plus}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farm Name</TableHead>
              <TableHead>Produce</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Harvest Date</TableHead>
              <TableHead>Shelf Life Left</TableHead>
              <TableHead>Urgency Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFarms.map((farm) => {
              const u = urgencyMap.get(farm._id || farm.id);
              const urgencyLevel = u?.urgencyLevel || 'LOW';
              const urgencyScore = u?.urgencyScore !== undefined ? u.urgencyScore : 0;

              return (
                <TableRow
                  key={farm._id || farm.id}
                  isClickable
                  onClick={() => setInspectingFarm(farm)}
                >
                  <TableCell className="font-semibold text-white">
                    <div>{farm.name}</div>
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-zinc-600" />
                      {farm.location?.latitude?.toFixed(4)}, {farm.location?.longitude?.toFixed(4)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="font-medium text-emerald-400">{farm.productName}</span>
                    <span className="text-xs text-zinc-400 block">{farm.productType}</span>
                  </TableCell>

                  <TableCell className="font-mono text-white font-semibold">
                    {formatWeight(farm.quantity)}
                  </TableCell>

                  <TableCell className="text-xs text-zinc-300 font-mono">
                    {formatDate(farm.harvestTime, 'standard')}
                    <span className="text-[10px] text-zinc-500 block">
                      ({formatDate(farm.harvestTime, 'relative')})
                    </span>
                  </TableCell>

                  <TableCell className="font-mono text-zinc-300">
                    {u ? (
                      <>
                        {formatShelfLife(u.remainingShelfLife)}
                        <span className="text-[10px] text-zinc-500 block">
                          ({u.remainingPercentage?.toFixed(0)}% left)
                        </span>
                      </>
                    ) : (
                      formatShelfLife(farm.shelfLife)
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant={urgencyLevel.toLowerCase()} dot>
                      {urgencyScore} • {urgencyLevel}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingFarm(farm);
                          setIsFarmModalOpen(true);
                        }}
                        title="Edit Farm"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingFarm(farm)}
                        title="Delete Farm"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-300" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Farm Create/Edit Modal */}
      <FarmModal
        isOpen={isFarmModalOpen}
        onClose={() => {
          setIsFarmModalOpen(false);
          setEditingFarm(null);
        }}
        farm={editingFarm}
        onSuccess={fetchFarmsAndUrgency}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingFarm)}
        onClose={() => setDeletingFarm(null)}
        title="Confirm Farm Deletion"
        description="Are you sure you want to permanently delete this farm record?"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            Farm <strong className="text-white">"{deletingFarm?.name}"</strong> with produce{' '}
            <strong className="text-emerald-400">{deletingFarm?.productName}</strong> ({formatWeight(deletingFarm?.quantity)}) will be permanently deleted from the database.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-900">
            <Button variant="outline" onClick={() => setDeletingFarm(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteFarm} isLoading={isDeleting}>
              Delete Farm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Farm Detail Inspector Drawer */}
      <Drawer
        isOpen={Boolean(inspectingFarm)}
        onClose={() => setInspectingFarm(null)}
        title={inspectingFarm?.name || 'Farm Details'}
        subtitle={`ID: ${inspectingFarm?._id || inspectingFarm?.id}`}
        footer={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingFarm(inspectingFarm);
                setIsFarmModalOpen(true);
                setInspectingFarm(null);
              }}
            >
              Edit Details
            </Button>
            <Button variant="primary" size="sm" onClick={() => setInspectingFarm(null)}>
              Close
            </Button>
          </div>
        }
      >
        {inspectingFarm && (
          <div className="space-y-6 text-sm">
            {/* Quick Badges */}
            <div className="flex items-center gap-2">
              <Badge variant="default">{inspectingFarm.productType}</Badge>
              {(() => {
                const u = urgencyMap.get(inspectingFarm._id || inspectingFarm.id);
                if (u) {
                  return (
                    <Badge variant={u.urgencyLevel?.toLowerCase()} dot>
                      Urgency Score: {u.urgencyScore} ({u.urgencyLevel})
                    </Badge>
                  );
                }
                return null;
              })()}
            </div>

            {/* Produce Summary Card */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-semibold uppercase text-zinc-400 font-mono tracking-wider">
                Produce Specifications
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-zinc-500 block">Product</span>
                  <span className="text-base font-bold text-white">{inspectingFarm.productName}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Quantity</span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {formatWeight(inspectingFarm.quantity)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Harvest Timestamp</span>
                  <span className="text-xs font-mono text-zinc-200">
                    {formatDate(inspectingFarm.harvestTime, 'standard')}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Total Shelf Life</span>
                  <span className="text-xs font-mono text-zinc-200">
                    {inspectingFarm.shelfLife} hours
                  </span>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <h4 className="text-xs font-semibold uppercase text-zinc-400 font-mono tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                Geographic Coordinates
              </h4>
              <div className="grid grid-cols-2 gap-4 font-mono text-xs pt-1">
                <div>
                  <span className="text-zinc-500 block">Latitude</span>
                  <span className="text-white font-semibold">{inspectingFarm.location?.latitude}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Longitude</span>
                  <span className="text-white font-semibold">{inspectingFarm.location?.longitude}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default Farms;
