const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports (like 587)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // For Gmail, we often need to authorize or use specific settings
        service: process.env.EMAIL_HOST === 'smtp.gmail.com' ? 'gmail' : undefined
    });

    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Royal Hotel'} <${process.env.EMAIL_USER}>`, // Use EMAIL_USER for from to avoid Gmail errors
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
        attachments: options.attachments || [],
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Nodemailer Error:', error);
        throw error; // Re-throw so controller can handle it
    }
};

module.exports = sendEmail;
