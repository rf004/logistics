import React, { useEffect, useState, useMemo } from 'react';
import {
  Truck as TruckIcon,
  Plus,
  Search,
  Trash2,
  Edit2,
  MapPin,
  RefreshCw,
  Layers,
  Scale,
  Maximize2,
  CheckCircle,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Skeleton, { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import TruckModal from '../components/forms/TruckModal';

import truckService from '../services/truckService';
import { useToast } from '../context/ToastContext';
import { formatWeight, truncateId } from '../utils/formatters';

export function Trucks() {
  const { success, error } = useToast();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [deletingTruck, setDeletingTruck] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const data = await truckService.getAllTrucks();
      setTrucks(data || []);
    } catch (err) {
      error(err.message || 'Failed to load fleet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const filteredTrucks = useMemo(() => {
    return trucks.filter((t) => {
      const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'AVAILABLE' && t.available) ||
        (statusFilter === 'UNAVAILABLE' && !t.available);

      return matchesSearch && matchesStatus;
    });
  }, [trucks, searchQuery, statusFilter]);

  const handleDelete = async () => {
    if (!deletingTruck) return;
    try {
      setIsDeleting(true);
      await truckService.deleteTruck(deletingTruck._id || deletingTruck.id);
      success(`Truck "${deletingTruck.name}" removed from fleet.`);
      setDeletingTruck(null);
      fetchTrucks();
    } catch (err) {
      error(err.message || 'Failed to delete truck');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPayloadCapacity = trucks.reduce((acc, t) => acc + (Number(t.capacity) || 0), 0);
  const availableCount = trucks.filter((t) => t.available).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="Fleet Management"
        subtitle="Manage transport vehicles, payload limits, bridge clearance dimensions, and depot locations."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchTrucks}>
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingTruck(null);
                setIsModalOpen(true);
              }}
            >
              Add Vehicle
            </Button>
          </>
        }
      />

      {/* Fleet KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs font-mono text-zinc-400 mb-1">Total Fleet Size</div>
          <div className="text-2xl font-bold font-mono text-white">{trucks.length} Trucks</div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Commercial vehicles</span>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-mono text-zinc-400 mb-1">Available for Assignment</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {availableCount} <span className="text-xs text-zinc-500 font-normal">/ {trucks.length} ready</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">In depot position</span>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-mono text-zinc-400 mb-1">Total Fleet Capacity</div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {formatWeight(totalPayloadCapacity)}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Combined transport capacity</span>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            icon={Search}
            placeholder="Search truck by identifier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          >
            <option value="ALL" className="bg-zinc-950">All Fleet Statuses</option>
            <option value="AVAILABLE" className="bg-zinc-950">Available for Assignment</option>
            <option value="UNAVAILABLE" className="bg-zinc-950">Assigned / In Transit</option>
          </select>
        </div>
      </Card>

      {/* Trucks Grid */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : filteredTrucks.length === 0 ? (
        <EmptyState
          icon={TruckIcon}
          title="No fleet vehicles found"
          description="Register trucks to calculate capacity-constrained transportation plans."
          actionLabel="Add Vehicle"
          onAction={() => {
            setEditingTruck(null);
            setIsModalOpen(true);
          }}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrucks.map((truck) => (
            <Card key={truck._id || truck.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-white tracking-tight">{truck.name}</h3>
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-zinc-600" />
                      {truck.currentLocation?.latitude?.toFixed(4)}, {truck.currentLocation?.longitude?.toFixed(4)}
                    </span>
                  </div>
                  <Badge variant={truck.available ? 'success' : 'neutral'} size="sm" dot>
                    {truck.available ? 'AVAILABLE' : 'ASSIGNED'}
                  </Badge>
                </div>

                {/* Specs */}
                <div className="mt-4 pt-3 border-t border-zinc-900 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px] uppercase">Payload Capacity</span>
                    <span className="font-bold text-white">{formatWeight(truck.capacity)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px] uppercase">Max Road Weight</span>
                    <span className="font-bold text-white">{formatWeight(truck.maxWeight)}</span>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="mt-3 p-2.5 rounded-lg bg-zinc-900/30 border border-zinc-850 text-xs font-mono flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] uppercase flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-zinc-500" /> Dimensions
                  </span>
                  <span className="text-zinc-200">
                    {truck.length}m (L) × {truck.width}m (W) × {truck.height}m (H)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-900/80">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Edit2}
                  onClick={() => {
                    setEditingTruck(truck);
                    setIsModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  className="text-red-400 hover:text-red-300"
                  onClick={() => setDeletingTruck(truck)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Truck Modal */}
      <TruckModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTruck(null);
        }}
        truck={editingTruck}
        onSuccess={fetchTrucks}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingTruck)}
        onClose={() => setDeletingTruck(null)}
        title="Confirm Vehicle Removal"
        description="Are you sure you want to permanently remove this vehicle from the fleet?"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            Vehicle <strong className="text-white">"{deletingTruck?.name}"</strong> with capacity{' '}
            <strong className="text-amber-400">{formatWeight(deletingTruck?.capacity)}</strong> will be deleted.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-900">
            <Button variant="outline" onClick={() => setDeletingTruck(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Vehicle
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Trucks;
