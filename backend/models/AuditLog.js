const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    admin: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    action: { 
        type: String, 
        required: true 
    },
    details: { 
        type: String, 
        required: true 
    },
    targetId: { 
        type: mongoose.Schema.Types.ObjectId 
    },
    targetModel: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
