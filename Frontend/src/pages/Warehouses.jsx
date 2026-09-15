import React, { useEffect, useState, useMemo } from 'react';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  Trash2,
  Edit2,
  MapPin,
  RefreshCw,
  Layers,
  CheckCircle,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import CapacityBar from '../components/ui/CapacityBar';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Skeleton, { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import WarehouseModal from '../components/forms/WarehouseModal';

import warehouseService from '../services/warehouseService';
import { useToast } from '../context/ToastContext';
import { formatWeight, truncateId } from '../utils/formatters';

export function Warehouses() {
  const { success, error } = useToast();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const data = await warehouseService.getAllWarehouses();
      setWarehouses(data || []);
    } catch (err) {
      error(err.message || 'Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) =>
      w.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [warehouses, searchQuery]);

  const handleDelete = async () => {
    if (!deletingWarehouse) return;
    try {
      setIsDeleting(true);
      await warehouseService.deleteWarehouse(deletingWarehouse._id || deletingWarehouse.id);
      success(`Warehouse "${deletingWarehouse.name}" deleted successfully.`);
      setDeletingWarehouse(null);
      fetchWarehouses();
    } catch (err) {
      error(err.message || 'Failed to delete warehouse');
    } finally {
      setIsDeleting(false);
    }
  };

  // Overall Storage Stats
  const totalCapacity = warehouses.reduce((acc, w) => acc + (Number(w.capacity) || 0), 0);
  const totalAvailable = warehouses.reduce((acc, w) => acc + (Number(w.availableStorage) || 0), 0);
  const totalUsed = Math.max(0, totalCapacity - totalAvailable);
  const globalUtilization = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="Warehouse Facilities"
        subtitle="Manage agricultural storage capacity, storage availability, and geographic intake hubs."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchWarehouses}>
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingWarehouse(null);
                setIsModalOpen(true);
              }}
            >
              Add Warehouse
            </Button>
          </>
        }
      />

      {/* Global Storage Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs font-mono text-zinc-400 mb-1">Total System Capacity</div>
          <div className="text-2xl font-bold font-mono text-white">{formatWeight(totalCapacity)}</div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Across {warehouses.length} facilities</span>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-mono text-zinc-400 mb-1">Available Free Storage</div>
          <div className="text-2xl font-bold font-mono text-blue-400">{formatWeight(totalAvailable)}</div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Ready for produce intake</span>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-mono text-zinc-400 mb-1">Capacity Utilization</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {globalUtilization.toFixed(1)}%
          </div>
          <div className="mt-2">
            <CapacityBar used={totalUsed} total={totalCapacity} showLabel={false} height="h-1.5" />
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <Input
          icon={Search}
          placeholder="Search warehouses by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* Warehouses Cards & Table */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : filteredWarehouses.length === 0 ? (
        <EmptyState
          icon={WarehouseIcon}
          title="No warehouses found"
          description="Register storage facilities to enable storage feasibility allocation."
          actionLabel="Add Warehouse"
          onAction={() => {
            setEditingWarehouse(null);
            setIsModalOpen(true);
          }}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWarehouses.map((wh) => {
            const used = Math.max(0, (Number(wh.capacity) || 0) - (Number(wh.availableStorage) || 0));
            const percentage = wh.capacity > 0 ? (used / wh.capacity) * 100 : 0;
            const hasFreeSpace = (wh.availableStorage || 0) > 0;

            return (
              <Card key={wh._id || wh.id} className="flex flex-col justify-between p-5 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-white tracking-tight">{wh.name}</h3>
                      <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-zinc-600" />
                        {wh.location?.latitude?.toFixed(4)}, {wh.location?.longitude?.toFixed(4)}
                      </span>
                    </div>
                    <Badge variant={hasFreeSpace ? 'success' : 'danger'} size="sm" dot>
                      {hasFreeSpace ? 'Available' : 'Full'}
                    </Badge>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4 pt-3 border-t border-zinc-900 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span>Utilization</span>
                      <span className="text-white font-bold">{percentage.toFixed(1)}%</span>
                    </div>
                    <CapacityBar used={used} total={wh.capacity} showLabel={false} height="h-2.5" />
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                      <span>Available: {formatWeight(wh.availableStorage)}</span>
                      <span>Total: {formatWeight(wh.capacity)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-900/80">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit2}
                    onClick={() => {
                      setEditingWarehouse(wh);
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
                    onClick={() => setDeletingWarehouse(wh)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Warehouse Modal */}
      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWarehouse(null);
        }}
        warehouse={editingWarehouse}
        onSuccess={fetchWarehouses}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingWarehouse)}
        onClose={() => setDeletingWarehouse(null)}
        title="Confirm Warehouse Deletion"
        description="Are you sure you want to permanently delete this warehouse facility?"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            Facility <strong className="text-white">"{deletingWarehouse?.name}"</strong> with total capacity{' '}
            <strong className="text-blue-400">{formatWeight(deletingWarehouse?.capacity)}</strong> will be removed.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-900">
            <Button variant="outline" onClick={() => setDeletingWarehouse(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Facility
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Warehouses;
