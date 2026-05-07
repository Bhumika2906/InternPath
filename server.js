const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load variables from .env file
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// 1. Connect to MongoDB (Atlas or Local)
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/internship_db';

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB Successfully!'))
    .catch(err => {
        console.error('Could not connect to MongoDB.');
        console.error('If using Atlas, check your .env file. If local, make sure MongoDB is running.');
        console.error('Error:', err.message);
    });

// 2. Define the Application Schema (What our data looks like)
const applicationSchema = new mongoose.Schema({
    appId: Number, // Custom unique ID from the frontend
    internshipId: Number,
    jobTitle: String,
    company: String,
    studentName: String,
    studentEmail: String,
    appliedDate: String,
    status: { type: String, default: 'applied' }
});

// Specify the collection name 'webp_endterm' as the third argument
const Application = mongoose.model('Application', applicationSchema, 'webp_endterm');

// 3. API Routes

// Get all applications from MongoDB
app.get('/api/applications', async (req, res) => {
    try {
        const apps = await Application.find();
        res.json(apps);
    } catch (err) {
        console.error("Database error:", err.message);
        // Return an empty array so the frontend doesn't crash with .filter errors
        res.status(500).json([]); 
    }
});

// Save a new application to MongoDB
app.post('/api/applications', async (req, res) => {
    try {
        const newApp = new Application(req.body);
        await newApp.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update status in MongoDB
app.put('/api/applications/:id', async (req, res) => {
    try {
        // Note: MongoDB uses _id by default, but we are using the timestamp id from JS
        await Application.findOneAndUpdate(
            { appId: Number(req.params.id) }, // Find by our custom appId
            { status: req.body.status }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
