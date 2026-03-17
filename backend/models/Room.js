const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotel: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hotel', 
        required: true 
    },
    roomType: { 
        type: String, 
        required: true,
        enum: ['Single', 'Double', 'Suite', 'Deluxe']
    },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    availability: { type: Boolean, default: true },
    totalRooms: { type: Number, required: true },
    occupiedRooms: { type: Number, default: 0 },
    roomStatus: { 
        type: String, 
        enum: ['Available', 'Cleaning', 'Maintenance'],
        default: 'Available'
    },
    weekendMultiplier: { type: Number, default: 1.2 } // 20% increase by default
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
