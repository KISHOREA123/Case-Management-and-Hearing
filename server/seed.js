const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        const adminExists = await User.findOne({ email: 'admin@lexiscloud.com' });
        if (adminExists) {
            console.log('Admin user already exists.');
            process.exit();
        }

        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@lexiscloud.com',
            password: 'admin123', // This will be hashed by the pre-save hook in User model
            role: 'admin',
            phone: '1234567890'
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@lexiscloud.com');
        console.log('Password: admin123');

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
