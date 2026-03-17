const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    hotel: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hotel', 
        required: true 
    },
    room: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Room', 
        required: true 
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Checked-in'], 
        default: 'Pending' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['Pending', 'Paid', 'Failed', 'Unpaid'], 
        default: 'Unpaid' 
    },
    guests: { type: Number, default: 1 },
    paymentId: { type: String },
    selectedExtras: [{
        name: { type: String },
        price: { type: Number }
    }],
    qrCode: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
