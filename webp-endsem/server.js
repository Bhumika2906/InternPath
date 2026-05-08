const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // .env file
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// connect to mongoDB Atlas or local
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/internship_db';

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB Successfully!'))
    .catch(err => {
        console.error('Could not connect to MongoDB.');
        console.error('Error:', err.message);
    });

// application schema
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

// collection name in which entries stored in atlas
const Application = mongoose.model('Application', applicationSchema, 'webp_endterm');

//get all applications from mongo
app.get('/api/applications', async (req, res) => {
    try {
        const apps = await Application.find();
        res.json(apps);
    } catch (err) {
        console.error("Database error:", err.message);
        res.status(500).json([]); 
    }
});

//save new application to mongo
app.post('/api/applications', async (req, res) => {
    try {
        const newApp = new Application(req.body);
        await newApp.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//update status in mongo
app.put('/api/applications/:id', async (req, res) => {
    try {
        
        await Application.findOneAndUpdate(
            { appId: Number(req.params.id) }, // find by our custom appId
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
