const nodemailerConfig = require('../config/nodemailerConfig');

// Function to send email notification
const sendNotification = async (to, subject, message) => {
    try {
        const transporter = nodemailerConfig();
        const mailOptions = {
            from: `"Aarambh Job Portal" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: message
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendNotification;
