const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
    commissionRate: { 
        type: Number, 
        default: 10 // Default 10% commission
    },
    fixedFee: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
