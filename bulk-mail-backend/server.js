const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Enable CORS for all origins and methods
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Define Email Schema & Model
const emailSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    body: { type: String, required: true },
    recipients: [{ type: String }],
    status: { type: String, default: 'Pending' },
    sentAt: { type: Date, default: Date.now }
});

const EmailLog = mongoose.model('EmailLog', emailSchema);

// Configure Nodemailer Transporter with explicit Gmail SSL settings for cloud platforms
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // avoids handshake failures on cloud servers
    }
});

// API Route: Send Bulk Emails
app.post('/api/send-mails', async (req, res) => {
    const { subject, body, recipients } = req.body;

    if (!subject || !body || !recipients || recipients.length === 0) {
        return res.status(400).json({ success: false, message: 'All fields are required and recipient list cannot be empty.' });
    }

    let emailLog = new EmailLog({
        subject,
        body,
        recipients,
        status: 'Processing'
    });

    try {
        let mailOptions = {
            from: process.env.EMAIL_USER,
            subject: subject,
            text: body,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">${body.replace(/\n/g, '<br>')}</div>`
        };

        for (let recipient of recipients) {
            mailOptions.to = recipient.trim();
            await transporter.sendMail(mailOptions);
        }

        emailLog.status = 'Success';
        await emailLog.save();

        res.status(200).json({ success: true, message: `Successfully sent bulk emails to ${recipients.length} recipients!`, logId: emailLog._id });
    } catch (error) {
        console.error('Error sending email:', error);
        emailLog.status = 'Failed';
        await emailLog.save();
        res.status(500).json({ success: false, message: 'Failed to send emails', error: error.message });
    }
});

// API Route: Fetch Email History
app.get('/api/history', async (req, res) => {
    try {
        const history = await EmailLog.find().sort({ sentAt: -1 }).limit(20);
        res.status(200).json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch history', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));