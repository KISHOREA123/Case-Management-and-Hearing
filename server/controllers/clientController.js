const { Client } = require('../models');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'lawyer') {
            query.assigned_lawyer = req.user.id;
        }

        const clients = await Client.find(query)
            .populate('related_case_id', 'case_title case_number')
            .populate('assigned_lawyer', 'name');

        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a client
// @route   POST /api/clients
// @access  Private (Admin, Lawyer)
const createClient = async (req, res) => {
    try {
        const { name, email, phone, related_case_id } = req.body;
        const assigned_lawyer = req.user.role === 'lawyer' ? req.user.id : req.body.assigned_lawyer;

        const client = await Client.create({
            name,
            email,
            phone,
            related_case_id,
            assigned_lawyer
        });

        res.status(201).json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private (Admin, Lawyer)
const updateClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private (Admin)
const deleteClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json({ message: 'Client removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getClients, createClient, updateClient, deleteClient };
