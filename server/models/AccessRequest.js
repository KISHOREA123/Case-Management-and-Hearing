const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema({
    client_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    case_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Case',
        required: true
    },
    lawyer_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    request_date: {
        type: Date,
        default: Date.now
    },
    client_details: {
        name: String,
        phone: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AccessRequest', accessRequestSchema);
