const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Promotion title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validTo: {
    type: Date,
    required: true,
  },
  applicableHotels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  couponCode: {
    type: String,
    uppercase: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'manager'],
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
