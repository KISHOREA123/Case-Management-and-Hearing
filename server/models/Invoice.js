const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoice_number: {
        type: String,
        required: [true, 'Please add an invoice number'],
        unique: true
    },
    case_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Case'
    },
    client_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Client'
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount']
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    },
    issue_date: {
        type: Date,
        default: Date.now
    },
    due_date: {
        type: Date
    },
    items: [{
        description: { type: String, required: true },
        amount: { type: Number, required: true }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
