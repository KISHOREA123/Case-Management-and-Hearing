const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { User } = require('./models');

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const users = await User.find({ role: { $in: ['client', 'lawyer'] } }).select('name email role phone');
        
        console.log('\n--- Lawyer Users ---');
        users.filter(u => u.role === 'lawyer').forEach(u => {
            console.log(`Name: ${u.name} | Email: ${u.email} | Phone: ${u.phone || 'N/A'}`);
        });

        console.log('\n--- Client Users ---');
        users.filter(u => u.role === 'client').forEach(u => {
            console.log(`Name: ${u.name} | Email: ${u.email} | Phone: ${u.phone || 'N/A'}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

listUsers();
