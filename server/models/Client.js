const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    related_case_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Case'
    },
    assigned_lawyer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    role: {
        type: String,
        enum: ['Petitioner', 'Defender'],
        default: 'Petitioner'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);
