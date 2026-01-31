const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Appointment.deleteMany();
    await User.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashPassword = async (password) => await bcrypt.hash(password, salt);

    const users = [
      {
        name: 'Demo Patient',
        email: 'demo@caresync.com',
        password: await hashPassword('demo123'),
        role: 'patient',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        bloodGroup: 'O+',
        emergencyContact: { name: 'Emergency Contact', phone: '9876543210' },
      },
      {
        name: 'Dr. Sarah Wilson',
        email: 'doctor@caresync.com',
        password: await hashPassword('doctor123'),
        role: 'doctor',
        specialty: 'Cardiology',
        experience: 12,
        bio: 'Expert cardiologist with over a decade of experience in treating heart conditions.',
      },
      {
        name: 'Dr. John Doe',
        email: 'john@caresync.com',
        password: await hashPassword('doctor123'),
        role: 'doctor',
        specialty: 'Neurology',
        experience: 8,
        bio: 'Specialist in neurological disorders and brain health.',
      },
      {
        name: 'Dr. Emily Chen',
        email: 'emily@caresync.com',
        password: await hashPassword('doctor123'),
        role: 'doctor',
        specialty: 'General Medicine',
        experience: 15,
        bio: 'Dedicated general physician focusing on preventive care.',
      },
      {
        name: 'Admin User',
        email: 'admin@caresync.com',
        password: await hashPassword('admin123'),
        role: 'admin',
      },
    ];

    const medicines = [
      {
        name: 'Paracetamol 500mg',
        description: 'Effective pain reliever and fever reducer.',
        price: 50,
        category: 'Pain Relief',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
        requiresPrescription: false,
        rating: 4.5,
      },
      {
        name: 'Amoxicillin 250mg',
        description: 'Antibiotic used to treat bacterial infections.',
        price: 120,
        category: 'Antibiotics',
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop',
        requiresPrescription: true,
        rating: 4.8,
      },
      {
        name: 'Vitamin C 1000mg',
        description: 'Dietary supplement to boost immune system.',
        price: 300,
        category: 'Supplements',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=300&fit=crop',
        requiresPrescription: false,
        rating: 4.2,
      },
      {
        name: 'Insulin Glargine',
        description: 'Long-acting insulin for diabetes control.',
        price: 1500,
        category: 'Diabetes',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&h=300&fit=crop',
        requiresPrescription: true,
        rating: 4.9,
      },
      {
        name: 'Digital Thermometer',
        description: 'High precision digital thermometer.',
        price: 250,
        category: 'Generic',
        image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=300&h=300&fit=crop',
        requiresPrescription: false,
        rating: 4.6,
      },
    ];

    await User.insertMany(users);
    const Medicine = require('./models/Medicine');
    await Medicine.deleteMany();
    await Medicine.insertMany(medicines);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // destroyData(); // Not implemented, standard import wipes anyway
} else {
  importData();
}
