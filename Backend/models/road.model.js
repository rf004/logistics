const mongoose = require('mongoose');

const roadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Road name is required'],
      trim: true
    },
    startLocation: {
      latitude: {
        type: Number,
        required: [true, 'Start latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        required: [true, 'Start longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    endLocation: {
      latitude: {
        type: Number,
        required: [true, 'End latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        required: [true, 'End longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
      min: [0.0001, 'Distance must be greater than 0']
    },
    maxWidth: {
      type: Number,
      required: [true, 'Max width is required'],
      min: [0.0001, 'Max width must be greater than 0']
    },
    maxHeight: {
      type: Number,
      required: [true, 'Max height is required'],
      min: [0.0001, 'Max height must be greater than 0']
    },
    maxWeight: {
      type: Number,
      required: [true, 'Max weight is required'],
      min: [0.0001, 'Max weight must be greater than 0']
    },
    vehicleAllowed: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: {
        values: ['OPEN', 'CLOSED', 'RESTRICTED'],
        message: 'Status must be OPEN, CLOSED, or RESTRICTED'
      },
      default: 'OPEN'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Road', roadSchema);
