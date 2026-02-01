const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const User = require('../server/models/User');
const Appointment = require('../server/models/Appointment');

const checkData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        console.log('\n--- LATEST 3 USERS ---');
        const users = await User.find().sort({ createdAt: -1 }).limit(3);
        users.forEach(u => {
            console.log(`ID: ${u._id}`);
            console.log(`Name: ${u.name}`);
            console.log(`Phone: ${u.phone}`);
            console.log(`Email: ${u.email}`);
            console.log('-------------------');
        });

        console.log('\n--- LATEST 3 APPOINTMENTS ---');
        const appointments = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('patientId', 'name phone')
            .populate('doctorId', 'name');

        appointments.forEach(a => {
            console.log(`ID: ${a._id}`);
            console.log(`Patient: ${a.patientId ? a.patientId.name : 'Unknown'} (${a.patientId ? a.patientId.phone : 'N/A'})`);
            console.log(`Doctor: ${a.doctorId ? a.doctorId.name : 'Unknown'}`);
            console.log(`Date: ${new Date(a.date).toDateString()}`);
            console.log(`Time: ${a.time}`);
            console.log(`Status: ${a.status}`);
            console.log(`Booked Via: ${a.bookedVia}`);
            console.log('-------------------');
        });

        console.log('\nDone.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkData();
