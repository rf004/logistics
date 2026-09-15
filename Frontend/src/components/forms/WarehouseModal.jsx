import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import warehouseService from '../../services/warehouseService';
import { useToast } from '../../context/ToastContext';

export function WarehouseModal({ isOpen, onClose, warehouse = null, onSuccess }) {
  const isEditing = Boolean(warehouse);
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    availableStorage: '',
    latitude: '',
    longitude: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        capacity: warehouse.capacity !== undefined ? String(warehouse.capacity) : '',
        availableStorage: warehouse.availableStorage !== undefined ? String(warehouse.availableStorage) : '',
        latitude: warehouse.location?.latitude !== undefined ? String(warehouse.location.latitude) : '',
        longitude: warehouse.location?.longitude !== undefined ? String(warehouse.location.longitude) : '',
      });
    } else {
      setFormData({
        name: '',
        capacity: '50000',
        availableStorage: '50000',
        latitude: '18.5204',
        longitude: '73.8567',
      });
    }
    setFormErrors({});
  }, [warehouse, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Warehouse name is required';
    if (!formData.capacity || Number(formData.capacity) <= 0) errors.capacity = 'Capacity must be > 0';
    if (formData.availableStorage === '' || Number(formData.availableStorage) < 0) {
      errors.availableStorage = 'Available storage cannot be negative';
    } else if (Number(formData.availableStorage) > Number(formData.capacity)) {
      errors.availableStorage = 'Available storage cannot exceed total capacity';
    }
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
        availableStorage: Number(formData.availableStorage),
        location: {
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        },
      };

      if (isEditing) {
        const id = warehouse._id || warehouse.id;
        await warehouseService.updateWarehouse(id, payload);
        success(`Warehouse "${payload.name}" updated successfully!`);
      } else {
        await warehouseService.createWarehouse(payload);
        success(`Warehouse "${payload.name}" created successfully!`);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      error(err.message || 'Failed to save warehouse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Storage Facility' : 'Add Warehouse Facility'}
      description="Define storage depot capacity and geographic coordinates for produce intake."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Warehouse Name"
          name="name"
          placeholder="e.g. Central Agrilogistics Hub"
          value={formData.name}
          onChange={handleChange}
          error={formErrors.name}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Total Capacity (kg)"
            name="capacity"
            type="number"
            step="any"
            placeholder="50000"
            value={formData.capacity}
            onChange={handleChange}
            error={formErrors.capacity}
            required
          />

          <Input
            label="Available Storage (kg)"
            name="availableStorage"
            type="number"
            step="any"
            placeholder="50000"
            value={formData.availableStorage}
            onChange={handleChange}
            error={formErrors.availableStorage}
            helperText="Current free storage space"
            required
          />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Facility Location
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {isEditing ? 'Save Changes' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default WarehouseModal;
