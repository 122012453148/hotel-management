require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const test = async () => {
    try {
        console.log('--- Email Debug Test ---');
        console.log('Host:', process.env.EMAIL_HOST);
        console.log('Port:', process.env.EMAIL_PORT);
        console.log('User:', process.env.EMAIL_USER);
        
        await sendEmail({
            email: process.env.EMAIL_USER, // Send to self
            subject: 'Debug Test Email',
            message: 'If you see this, your Gmail SMTP is working!'
        });
        
        console.log('\nSUCCESS: Email sent successfully!');
    } catch (error) {
        console.error('\nFAILED: Could not send email.');
        console.error('Error Details:', error.message);
        if (error.code === 'EAUTH') {
            console.error('Suggestion: Check if your App Password is correct and that 2-FA is enabled.');
        } else if (error.code === 'ESOCKET') {
            console.error('Suggestion: Check your firewall or try port 465 with secure:true.');
        }
    }
};

test();
