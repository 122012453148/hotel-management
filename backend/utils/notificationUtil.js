const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');

const sendNotification = async (io, notificationData) => {
    const { userId, title, message, type, link, userEmail } = notificationData;

    try {
        // 1. Save to Database
        const notification = await Notification.create({
            user: userId,
            title,
            message,
            type,
            link
        });

        // 2. Send Real-time via Socket.io
        // io is the socket.io instance passed from server.js
        io.to(userId.toString()).emit('newNotification', notification);

        // 3. Send Email if userEmail is provided
        if (userEmail) {
            await sendEmail({
                email: userEmail,
                subject: title,
                message: message,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #333;">${title}</h2>
                        <p style="font-size: 16px; color: #555;">${message}</p>
                        ${link ? `<a href="${process.env.FRONTEND_URL}${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Details</a>` : ''}
                        <hr style="margin-top: 20px; border: none; border-top: 1px solid #eee;">
                        <p style="font-size: 12px; color: #999;">Notification from LuxeStay</p>
                    </div>
                `
            });
        }

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = sendNotification;
