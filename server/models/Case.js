const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    case_title: {
        type: String,
        required: [true, 'Please add a case title']
    },
    case_number: {
        type: String,
        unique: true,
        sparse: true   // allows multiple docs without case_number during migration
    },
    case_type_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'CaseType'
    },
    lawyer_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    petitioner: {
        type: String,
        required: [true, 'Please add a petitioner']
    },
    defender: {
        type: String,
        required: [true, 'Please add a defender']
    },
    court_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Court'
    },
    status: {
        type: String,
        enum: ['Draft', 'Filed', 'Under Investigation', 'Hearing Scheduled', 'Trial Ongoing', 'Judgment Pending', 'Closed'],
        default: 'Draft'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    filing_date: {
        type: Date
    },
    description: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Reverse populate with virtuals
caseSchema.virtual('hearings', {
    ref: 'Hearing',
    localField: '_id',
    foreignField: 'case_id',
    justOne: false
});

module.exports = mongoose.model('Case', caseSchema);
