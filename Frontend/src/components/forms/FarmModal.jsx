import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import farmService from '../../services/farmService';
import { useToast } from '../../context/ToastContext';

export function FarmModal({ isOpen, onClose, farm = null, onSuccess }) {
  const isEditing = Boolean(farm);
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    productName: '',
    productType: '',
    quantity: '',
    harvestTime: '',
    shelfLife: '',
    latitude: '',
    longitude: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || '',
        productName: farm.productName || '',
        productType: farm.productType || '',
        quantity: farm.quantity !== undefined ? String(farm.quantity) : '',
        harvestTime: farm.harvestTime ? new Date(farm.harvestTime).toISOString().slice(0, 16) : '',
        shelfLife: farm.shelfLife !== undefined ? String(farm.shelfLife) : '',
        latitude: farm.location?.latitude !== undefined ? String(farm.location.latitude) : '',
        longitude: farm.location?.longitude !== undefined ? String(farm.location.longitude) : '',
      });
    } else {
      // Default sample coordinates for quick testing
      const now = new Date();
      setFormData({
        name: '',
        productName: '',
        productType: 'Vegetables',
        quantity: '500',
        harvestTime: now.toISOString().slice(0, 16),
        shelfLife: '48',
        latitude: '18.5204',
        longitude: '73.8567',
      });
    }
    setFormErrors({});
  }, [farm, isOpen]);

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

    if (!formData.name.trim()) errors.name = 'Farm name is required';
    if (!formData.productName.trim()) errors.productName = 'Product name is required';
    if (!formData.productType.trim()) errors.productType = 'Product type is required';
    if (!formData.quantity || Number(formData.quantity) <= 0) errors.quantity = 'Quantity must be > 0';
    if (!formData.harvestTime) errors.harvestTime = 'Harvest time is required';
    if (!formData.shelfLife || Number(formData.shelfLife) <= 0) errors.shelfLife = 'Shelf life must be > 0';
    if (formData.latitude === '' || isNaN(Number(formData.latitude))) errors.latitude = 'Valid latitude is required';
    if (formData.longitude === '' || isNaN(Number(formData.longitude))) errors.longitude = 'Valid longitude is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        productName: formData.productName.trim(),
        productType: formData.productType.trim(),
        quantity: Number(formData.quantity),
        harvestTime: new Date(formData.harvestTime).toISOString(),
        shelfLife: Number(formData.shelfLife),
        location: {
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        },
      };

      if (isEditing) {
        const id = farm._id || farm.id;
        await farmService.updateFarm(id, payload);
        success(`Farm "${payload.name}" updated successfully!`);
      } else {
        await farmService.createFarm(payload);
        success(`Farm "${payload.name}" created successfully!`);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      error(err.message || 'Failed to save farm record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Farm Registration' : 'Register New Farm'}
      description="Enter agricultural produce, perishability, and location coordinates."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Farm Name"
          name="name"
          placeholder="e.g. Green Valley Agro Farm"
          value={formData.name}
          onChange={handleChange}
          error={formErrors.name}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product / Crop Name"
            name="productName"
            placeholder="e.g. Organic Tomatoes"
            value={formData.productName}
            onChange={handleChange}
            error={formErrors.productName}
            required
          />

          <Input
            label="Product Type / Category"
            name="productType"
            placeholder="e.g. Perishable Vegetables, Fruits, Grains"
            value={formData.productType}
            onChange={handleChange}
            error={formErrors.productType}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Quantity (kg)"
            name="quantity"
            type="number"
            step="any"
            placeholder="500"
            value={formData.quantity}
            onChange={handleChange}
            error={formErrors.quantity}
            required
          />

          <Input
            label="Shelf Life (Hours)"
            name="shelfLife"
            type="number"
            step="any"
            placeholder="48"
            value={formData.shelfLife}
            onChange={handleChange}
            error={formErrors.shelfLife}
            helperText="Total hours before spoilage"
            required
          />

          <Input
            label="Harvest Timestamp"
            name="harvestTime"
            type="datetime-local"
            value={formData.harvestTime}
            onChange={handleChange}
            error={formErrors.harvestTime}
            required
          />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Geographic Coordinates
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Latitude (-90 to 90)"
              name="latitude"
              type="number"
              step="any"
              placeholder="18.5204"
              value={formData.latitude}
              onChange={handleChange}
              error={formErrors.latitude}
              required
            />
            <Input
              label="Longitude (-180 to 180)"
              name="longitude"
              type="number"
              step="any"
              placeholder="73.8567"
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
            {isEditing ? 'Save Changes' : 'Register Farm'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default FarmModal;
