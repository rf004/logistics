import React, { useEffect, useState, useMemo } from 'react';
import {
  GitFork,
  Plus,
  Search,
  Trash2,
  Edit2,
  MapPin,
  RefreshCw,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Route,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Skeleton, { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import RoadModal from '../components/forms/RoadModal';

import roadService from '../services/roadService';
import { useToast } from '../context/ToastContext';
import { formatDistance, formatWeight, truncateId } from '../utils/formatters';
import { getRoadStatusConfig } from '../utils/statusColors';

export function Roads() {
  const { success, error } = useToast();
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoad, setEditingRoad] = useState(null);
  const [deletingRoad, setDeletingRoad] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoads = async () => {
    try {
      setLoading(true);
      const data = await roadService.getAllRoads();
      setRoads(data || []);
    } catch (err) {
      error(err.message || 'Failed to load roads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoads();
  }, []);

  const filteredRoads = useMemo(() => {
    return roads.filter((r) => {
      const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [roads, searchQuery, statusFilter]);

  const handleDelete = async () => {
    if (!deletingRoad) return;
    try {
      setIsDeleting(true);
      await roadService.deleteRoad(deletingRoad._id || deletingRoad.id);
      success(`Road segment "${deletingRoad.name}" deleted.`);
      setDeletingRoad(null);
      fetchRoads();
    } catch (err) {
      error(err.message || 'Failed to delete road');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalDistance = roads.reduce((acc, r) => acc + (Number(r.distance) || 0), 0);
  const openCount = roads.filter((r) => r.status === 'OPEN').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="Road Network Infrastructure"
        subtitle="Manage road topological links, maximum weight/clearance restrictions, and transit status."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchRoads}>
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingRoad(null);
                setIsModalOpen(true);
              }}
            >
              Add Road Link
            </Button>
          </>
        }
      />

      {/* Network Stats Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs font-mono text-zinc-400 mb-1">Total Road Network</div>
          <div className="text-2xl font-bold font-mono text-white">{roads.length} Segments</div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            {formatDistance(totalDistance)} total mapped corridor
          </span>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-mono text-zinc-400 mb-1">Open Corridor Links</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {openCount} <span className="text-xs text-zinc-500 font-normal">/ {roads.length} accessible</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Unrestricted logistics flow</span>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-mono text-zinc-400 mb-1">Restricted / Closed</div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {roads.length - openCount} Segments
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Subject to graph filtering</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            icon={Search}
            placeholder="Search road by name or route tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
          >
            <option value="ALL" className="bg-zinc-950">All Segment Statuses</option>
            <option value="OPEN" className="bg-zinc-950">OPEN (Accessible)</option>
            <option value="RESTRICTED" className="bg-zinc-950">RESTRICTED (Heavy limits)</option>
            <option value="CLOSED" className="bg-zinc-950">CLOSED (Blocked)</option>
          </select>
        </div>
      </Card>

      {/* Roads Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : filteredRoads.length === 0 ? (
        <EmptyState
          icon={GitFork}
          title="No road segments found"
          description="Register roads to allow Dijkstra pathfinding to navigate between farms and warehouses."
          actionLabel="Add Road Link"
          onAction={() => {
            setEditingRoad(null);
            setIsModalOpen(true);
          }}
          actionIcon={Plus}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Road Segment</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Clearances (W × H)</TableHead>
              <TableHead>Max Weight</TableHead>
              <TableHead>Vehicles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoads.map((road) => {
              const statusCfg = getRoadStatusConfig(road.status);
              return (
                <TableRow key={road._id || road.id}>
                  <TableCell className="font-semibold text-white">
                    <div>{road.name}</div>
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-zinc-600" />
                      {road.startLocation?.latitude?.toFixed(2)},{road.startLocation?.longitude?.toFixed(2)} &rarr;{' '}
                      {road.endLocation?.latitude?.toFixed(2)},{road.endLocation?.longitude?.toFixed(2)}
                    </span>
                  </TableCell>

                  <TableCell className="font-mono text-emerald-400 font-bold">
                    {formatDistance(road.distance)}
                  </TableCell>

                  <TableCell className="font-mono text-xs text-zinc-300">
                    {road.maxWidth}m × {road.maxHeight}m
                  </TableCell>

                  <TableCell className="font-mono text-xs text-zinc-300">
                    {formatWeight(road.maxWeight)}
                  </TableCell>

                  <TableCell>
                    <Badge variant={road.vehicleAllowed ? 'success' : 'danger'} size="sm">
                      {road.vehicleAllowed ? 'Allowed' : 'Prohibited'}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={road.status === 'OPEN' ? 'success' : road.status === 'RESTRICTED' ? 'warning' : 'danger'}
                      size="sm"
                      dot
                    >
                      {road.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingRoad(road);
                          setIsModalOpen(true);
                        }}
                        title="Edit Road"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingRoad(road)}
                        title="Delete Road"
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

      {/* Road Modal */}
      <RoadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoad(null);
        }}
        road={editingRoad}
        onSuccess={fetchRoads}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingRoad)}
        onClose={() => setDeletingRoad(null)}
        title="Confirm Road Deletion"
        description="Are you sure you want to delete this road network link?"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            Road <strong className="text-white">"{deletingRoad?.name}"</strong> ({formatDistance(deletingRoad?.distance)}) will be permanently removed from routing graphs.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-900">
            <Button variant="outline" onClick={() => setDeletingRoad(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Road
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Roads;
