import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import truckService from '../../services/truckService';
import { useToast } from '../../context/ToastContext';

export function TruckModal({ isOpen, onClose, truck = null, onSuccess }) {
  const isEditing = Boolean(truck);
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    latitude: '',
    longitude: '',
    width: '',
    height: '',
    length: '',
    maxWeight: '',
    available: true,
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (truck) {
      setFormData({
        name: truck.name || '',
        capacity: truck.capacity !== undefined ? String(truck.capacity) : '',
        latitude: truck.currentLocation?.latitude !== undefined ? String(truck.currentLocation.latitude) : '',
        longitude: truck.currentLocation?.longitude !== undefined ? String(truck.currentLocation.longitude) : '',
        width: truck.width !== undefined ? String(truck.width) : '',
        height: truck.height !== undefined ? String(truck.height) : '',
        length: truck.length !== undefined ? String(truck.length) : '',
        maxWeight: truck.maxWeight !== undefined ? String(truck.maxWeight) : '',
        available: truck.available !== undefined ? truck.available : true,
      });
    } else {
      setFormData({
        name: '',
        capacity: '5000',
        latitude: '18.5204',
        longitude: '73.8567',
        width: '2.5',
        height: '3.2',
        length: '8.0',
        maxWeight: '6000',
        available: true,
      });
    }
    setFormErrors({});
  }, [truck, isOpen]);

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

    if (!formData.name.trim()) errors.name = 'Truck name/identifier is required';
    if (!formData.capacity || Number(formData.capacity) <= 0) errors.capacity = 'Capacity must be > 0';
    if (!formData.maxWeight || Number(formData.maxWeight) <= 0) errors.maxWeight = 'Max weight must be > 0';
    if (!formData.width || Number(formData.width) <= 0) errors.width = 'Width must be > 0';
    if (!formData.height || Number(formData.height) <= 0) errors.height = 'Height must be > 0';
    if (!formData.length || Number(formData.length) <= 0) errors.length = 'Length must be > 0';
    if (formData.latitude === '' || isNaN(Number(formData.latitude))) errors.latitude = 'Valid latitude required';
    if (formData.longitude === '' || isNaN(Number(formData.longitude))) errors.longitude = 'Valid longitude required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        capacity: Number(formData.capacity),
        maxWeight: Number(formData.maxWeight),
        width: Number(formData.width),
        height: Number(formData.height),
        length: Number(formData.length),
        available: Boolean(formData.available),
        currentLocation: {
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        },
      };

      if (isEditing) {
        const id = truck._id || truck.id;
        await truckService.updateTruck(id, payload);
        success(`Truck "${payload.name}" updated successfully!`);
      } else {
        await truckService.createTruck(payload);
        success(`Truck "${payload.name}" added to fleet!`);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      error(err.message || 'Failed to save truck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Fleet Vehicle' : 'Register New Fleet Vehicle'}
      description="Define vehicle dimensions, carrying capacity, max road weight, and initial depot location."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Truck Identifier / Name"
          name="name"
          placeholder="e.g. Heavy Carrier Titan-01"
          value={formData.name}
          onChange={handleChange}
          error={formErrors.name}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Payload Capacity (kg)"
            name="capacity"
            type="number"
            step="any"
            placeholder="5000"
            value={formData.capacity}
            onChange={handleChange}
            error={formErrors.capacity}
            required
          />

          <Input
            label="Max Permissible Weight (kg)"
            name="maxWeight"
            type="number"
            step="any"
            placeholder="6000"
            value={formData.maxWeight}
            onChange={handleChange}
            error={formErrors.maxWeight}
            helperText="Used for road weight constraint checks"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Width (m)"
            name="width"
            type="number"
            step="any"
            placeholder="2.5"
            value={formData.width}
            onChange={handleChange}
            error={formErrors.width}
            required
          />

          <Input
            label="Height (m)"
            name="height"
            type="number"
            step="any"
            placeholder="3.2"
            value={formData.height}
            onChange={handleChange}
            error={formErrors.height}
            required
          />

          <Input
            label="Length (m)"
            name="length"
            type="number"
            step="any"
            placeholder="8.0"
            value={formData.length}
            onChange={handleChange}
            error={formErrors.length}
            required
          />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Current / Depot Location
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Latitude"
              name="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleChange}
              error={formErrors.latitude}
              required
            />
            <Input
              label="Longitude"
              name="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleChange}
              error={formErrors.longitude}
              required
            />
          </div>
        </div>

        <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-850 cursor-pointer">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
            className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700 focus:ring-emerald-500"
          />
          <div>
            <span className="text-sm font-medium text-white">Available for Deployment</span>
            <p className="text-xs text-zinc-400">Truck is currently in depot and eligible for assignment</p>
          </div>
        </label>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {isEditing ? 'Save Changes' : 'Register Vehicle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TruckModal;
