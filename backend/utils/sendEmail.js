const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log('--- SMTP Config Debug ---');
    console.log(`Host: ${process.env.EMAIL_HOST}`);
    console.log(`Port: ${process.env.EMAIL_PORT}`);
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`Pass length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0}`);
    console.log('------------------------');

    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false, // true for 465, false for other ports like 587 (STARTTLS)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            family: 4,
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
        from: `${process.env.FROM_NAME || 'Royal Hotel'} <${process.env.EMAIL_USER}>`, // Use EMAIL_USER for from to avoid Gmail SPF errors
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
