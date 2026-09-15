import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import roadService from '../../services/roadService';
import { useToast } from '../../context/ToastContext';

export function RoadModal({ isOpen, onClose, road = null, onSuccess }) {
  const isEditing = Boolean(road);
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    startLat: '',
    startLng: '',
    endLat: '',
    endLng: '',
    distance: '',
    maxWidth: '',
    maxHeight: '',
    maxWeight: '',
    vehicleAllowed: true,
    status: 'OPEN',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (road) {
      setFormData({
        name: road.name || '',
        startLat: road.startLocation?.latitude !== undefined ? String(road.startLocation.latitude) : '',
        startLng: road.startLocation?.longitude !== undefined ? String(road.startLocation.longitude) : '',
        endLat: road.endLocation?.latitude !== undefined ? String(road.endLocation.latitude) : '',
        endLng: road.endLocation?.longitude !== undefined ? String(road.endLocation.longitude) : '',
        distance: road.distance !== undefined ? String(road.distance) : '',
        maxWidth: road.maxWidth !== undefined ? String(road.maxWidth) : '',
        maxHeight: road.maxHeight !== undefined ? String(road.maxHeight) : '',
        maxWeight: road.maxWeight !== undefined ? String(road.maxWeight) : '',
        vehicleAllowed: road.vehicleAllowed !== undefined ? road.vehicleAllowed : true,
        status: road.status || 'OPEN',
      });
    } else {
      setFormData({
        name: '',
        startLat: '18.5204',
        startLng: '73.8567',
        endLat: '18.6000',
        endLng: '73.9000',
        distance: '15.5',
        maxWidth: '3.5',
        maxHeight: '4.5',
        maxWeight: '20000',
        vehicleAllowed: true,
        status: 'OPEN',
      });
    }
    setFormErrors({});
  }, [road, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Road segment name is required';
    if (!formData.distance || Number(formData.distance) <= 0) errors.distance = 'Distance must be > 0';
    if (!formData.maxWidth || Number(formData.maxWidth) <= 0) errors.maxWidth = 'Max width must be > 0';
    if (!formData.maxHeight || Number(formData.maxHeight) <= 0) errors.maxHeight = 'Max height must be > 0';
    if (!formData.maxWeight || Number(formData.maxWeight) <= 0) errors.maxWeight = 'Max weight must be > 0';
    if (formData.startLat === '' || isNaN(Number(formData.startLat))) errors.startLat = 'Valid start lat required';
    if (formData.startLng === '' || isNaN(Number(formData.startLng))) errors.startLng = 'Valid start lng required';
    if (formData.endLat === '' || isNaN(Number(formData.endLat))) errors.endLat = 'Valid end lat required';
    if (formData.endLng === '' || isNaN(Number(formData.endLng))) errors.endLng = 'Valid end lng required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        distance: Number(formData.distance),
        maxWidth: Number(formData.maxWidth),
        maxHeight: Number(formData.maxHeight),
        maxWeight: Number(formData.maxWeight),
        vehicleAllowed: Boolean(formData.vehicleAllowed),
        status: formData.status,
        startLocation: {
          latitude: Number(formData.startLat),
          longitude: Number(formData.startLng),
        },
        endLocation: {
          latitude: Number(formData.endLat),
          longitude: Number(formData.endLng),
        },
      };

      if (isEditing) {
        const id = road._id || road.id;
        await roadService.updateRoad(id, payload);
        success(`Road segment "${payload.name}" updated!`);
      } else {
        await roadService.createRoad(payload);
        success(`Road segment "${payload.name}" added to network!`);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      error(err.message || 'Failed to save road segment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Road Segment' : 'Add Road Network Segment'}
      description="Configure topological road link with physical truck clearance limitations."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Road Name / Route Tag"
          name="name"
          placeholder="e.g. Expressway Corridor NH-48"
          value={formData.name}
          onChange={handleChange}
          error={formErrors.name}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Distance (km)"
            name="distance"
            type="number"
            step="any"
            placeholder="15.5"
            value={formData.distance}
            onChange={handleChange}
            error={formErrors.distance}
            required
          />

          <Select
            label="Segment Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'OPEN', label: 'OPEN (Normal traffic)' },
              { value: 'RESTRICTED', label: 'RESTRICTED (Heavy vehicle curfew)' },
              { value: 'CLOSED', label: 'CLOSED (Maintenance / Blocked)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Max Width (m)"
            name="maxWidth"
            type="number"
            step="any"
            placeholder="3.5"
            value={formData.maxWidth}
            onChange={handleChange}
            error={formErrors.maxWidth}
            required
          />

          <Input
            label="Max Height (m)"
            name="maxHeight"
            type="number"
            step="any"
            placeholder="4.5"
            value={formData.maxHeight}
            onChange={handleChange}
            error={formErrors.maxHeight}
            required
          />

          <Input
            label="Max Weight (kg)"
            name="maxWeight"
            type="number"
            step="any"
            placeholder="20000"
            value={formData.maxWeight}
            onChange={handleChange}
            error={formErrors.maxWeight}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-850">
          <div className="space-y-2">
            <h5 className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
              Start Coordinates
            </h5>
            <Input
              label="Start Latitude"
              name="startLat"
              type="number"
              step="any"
              value={formData.startLat}
              onChange={handleChange}
              error={formErrors.startLat}
              required
            />
            <Input
              label="Start Longitude"
              name="startLng"
              type="number"
              step="any"
              value={formData.startLng}
              onChange={handleChange}
              error={formErrors.startLng}
              required
            />
          </div>

          <div className="space-y-2">
            <h5 className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
              End Coordinates
            </h5>
            <Input
              label="End Latitude"
              name="endLat"
              type="number"
              step="any"
              value={formData.endLat}
              onChange={handleChange}
              error={formErrors.endLat}
              required
            />
            <Input
              label="End Longitude"
              name="endLng"
              type="number"
              step="any"
              value={formData.endLng}
              onChange={handleChange}
              error={formErrors.endLng}
              required
            />
          </div>
        </div>

        <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-850 cursor-pointer">
          <input
            type="checkbox"
            name="vehicleAllowed"
            checked={formData.vehicleAllowed}
            onChange={handleChange}
            className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700 focus:ring-emerald-500"
          />
          <div>
            <span className="text-sm font-medium text-white">Commercial Vehicles Allowed</span>
            <p className="text-xs text-zinc-400">Road passes clearance for logistics trucks</p>
          </div>
        </label>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {isEditing ? 'Save Changes' : 'Add Road Segment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RoadModal;
