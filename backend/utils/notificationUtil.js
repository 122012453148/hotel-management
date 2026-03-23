const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');
const path = require('path');
const fs = require('fs');

const sendNotification = async (io, notificationData) => {
    const { userId, title, message, type, link, userEmail, payload } = notificationData;

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
        if (io) {
            io.to(userId.toString()).emit('newNotification', notification);
        }

        // 3. Send Branded Email if userEmail is provided
        if (userEmail) {
            const logoPath = path.join(__dirname, '../../frontend/public/logo.png');
            const hasLogo = fs.existsSync(logoPath);
            
            // Build dynamic payload details (e.g., booking details)
            let payloadDetailsHTML = '';
            if (payload && typeof payload === 'object') {
                payloadDetailsHTML = `
                    <div style="background-color: #ffffff; border: 1px solid #e5ead7; border-radius: 16px; padding: 20px; margin: 20px 0; text-align: left;">
                        ${Object.entries(payload).map(([key, value]) => `
                            <div style="margin-bottom: 10px; border-bottom: 1px solid #f8faf5; padding-bottom: 5px;">
                                <span style="color: #a1bc98; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: block;">${key}</span>
                                <span style="color: #2c332b; font-size: 15px; font-weight: 700;">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            const htmlContent = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; padding: 40px; border: 1px solid #e5ead7; border-radius: 30px; text-align: center; background-color: #fafbf5;">
                    ${hasLogo ? '<img src="cid:logo" alt="Royal Hotel" style="width: 100px; margin-bottom: 30px;">' : '<h2 style="color: #2c332b; margin-bottom: 30px;">ROYAL HOTEL</h2>'}
                    <h2 style="color: #2c332b; font-size: 24px; font-weight: 900; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">${title}</h2>
                    <p style="font-size: 16px; color: #667064; line-height: 1.6; margin-bottom: 25px;">${message}</p>
                    
                    ${payloadDetailsHTML}

                    ${link ? `<div style="margin-top: 30px;"><a href="${process.env.FRONTEND_URL}${link}" style="display: inline-block; padding: 16px 36px; background-color: #2c332b; color: #ffffff !important; text-decoration: none; border-radius: 40px; font-weight: 800; font-size: 14px; letter-spacing: 1.5px; box-shadow: 0 10px 20px rgba(0,0,0,0.12);">VIEW DETAILS</a></div>` : ''}
                    
                    <div style="margin-top: 50px; font-size: 12px; color: #a1bc98; font-weight: 700; border-top: 1px solid #e5ead7; padding-top: 25px; text-transform: uppercase; letter-spacing: 2px;">
                        &copy; 2026 Royal Hotel Bookings. All rights reserved.
                    </div>
                </div>
            `;

            const emailOptions = {
                email: userEmail,
                subject: `${title} | Royal Hotel`,
                html: htmlContent
            };

            if (hasLogo) {
                emailOptions.attachments = [{
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'logo'
                }];
            }

            await sendEmail(emailOptions);
        }

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = sendNotification;
