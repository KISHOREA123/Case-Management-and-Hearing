const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Case, AccessRequest } = require('./models');

dotenv.config();

const diagnostics = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const users = await User.find({ role: 'client' });
        console.log(`\nFound ${users.length} clients:`);
        users.forEach(u => console.log(`- ${u.name} (ID: ${u._id})`));

        const requests = await AccessRequest.find().populate('client_id', 'name').populate('case_id', 'case_number');
        console.log(`\nFound ${requests.length} Access Requests:`);
        requests.forEach(r => {
            console.log(`- Request for ${r.case_id?.case_number} by ${r.client_id?.name || 'Unknown'} (ID: ${r.client_id?._id}) - Status: ${r.status}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
};

diagnostics();
