const mongoose = require('mongoose');

const caseDeadlineSchema = new mongoose.Schema({
    case_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Case',
        required: true
    },
    deadline_title: {
        type: String,
        required: true,
        trim: true
    },
    deadline_date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Missed'],
        default: 'Pending'
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CaseDeadline', caseDeadlineSchema);
