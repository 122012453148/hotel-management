const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Notifies all admins about a specific event
 * @param {Object} app - Express app instance to get socketio
 * @param {Object} notificationData - { title, message, type, link }
 */
const notifyAdmins = async (app, notificationData) => {
    try {
        const admins = await User.find({ role: 'admin' });
        const io = app.get('socketio');

        for (const admin of admins) {
            // Save notification to DB
            const notification = await Notification.create({
                user: admin._id,
                ...notificationData
            });

            // Emit via socket if online
            if (io) {
                io.to(admin._id.toString()).emit('newNotification', notification);
            }
        }
    } catch (error) {
        console.error('Notification Error:', error);
    }
};

module.exports = { notifyAdmins };
