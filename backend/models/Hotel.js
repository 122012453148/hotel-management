const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String },
    address: { type: String },
    zipCode: { type: String },
    description: { type: String, required: true },
    images: [{ type: String }],
    amenities: [{ type: String }],
    extraServices: [{
        name: { type: String },
        price: { type: Number },
        icon: { type: String }
    }],
    manager: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
