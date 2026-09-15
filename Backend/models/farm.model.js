const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    productType: {
      type: String,
      required: [true, 'Product type is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.0001, 'Quantity must be greater than 0']
    },
    harvestTime: {
      type: Date,
      required: [true, 'Harvest time is required']
    },
    shelfLife: {
      type: Number,
      required: [true, 'Shelf life is required'],
      min: [0.0001, 'Shelf life must be greater than 0']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Farm', farmSchema);
