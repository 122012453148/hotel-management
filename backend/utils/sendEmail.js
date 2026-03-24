const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Priority: Use the new SMTP_ variables, fallback to old EMAIL_ ones
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const fromEmail = process.env.FROM_EMAIL || user;

    console.log('--- SMTP Config Debug ---');
    console.log(`Host: ${host}`);
    console.log(`Port: ${port}`);
    console.log(`User: ${user}`);
    console.log(`From: ${fromEmail}`);
    console.log('------------------------');

    // Create a transporter
    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // True for 465 (SMTPS), false for others like 587 (STARTTLS)
        family: 4,           // Force IPv4 for Render reliability
        auth: {
            user,
            pass,
        },
        connectionTimeout: 15000, // 15s
        greetingTimeout: 15000,
        tls: {
            rejectUnauthorized: true
        }
    });

    // Verification check to debug connection in logs
    try {
        await transporter.verify();
        console.log('SMTP connection verified successfully');
    } catch (verifError) {
        console.error('SMTP Connection Verification Failed:', verifError.message);
        // We continue anyway, but the log will help identify the issue (port block, auth failure, etc.)
    }

    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Royal Hotel'} <${fromEmail}>`, 
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
        console.error('Nodemailer Send Error:', error.message);
        throw error; // Re-throw so controller or utility can handle it
    }
};

module.exports = sendEmail;
