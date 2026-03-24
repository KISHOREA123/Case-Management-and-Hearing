const CaseDeadline = require('../models/CaseDeadline');
const { Case } = require('../models');

// @desc    Get all deadlines for a case
// @route   GET /api/cases/:id/deadlines
// @access  Private
const getDeadlines = async (req, res) => {
    try {
        const deadlines = await CaseDeadline.find({ case_id: req.params.id })
            .populate('created_by', 'name')
            .sort('deadline_date');
        res.json(deadlines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get upcoming deadlines (within 7 days) for a user's cases
// @route   GET /api/deadlines/upcoming
// @access  Private
const getUpcomingDeadlines = async (req, res) => {
    try {
        const now = new Date();
        const in7Days = new Date();
        in7Days.setDate(in7Days.getDate() + 7);

        let caseFilter = {};
        if (req.user.role === 'lawyer') {
            const cases = await Case.find({ lawyer_id: req.user.id }).select('_id');
            caseFilter = { case_id: { $in: cases.map(c => c._id) } };
        }

        const upcoming = await CaseDeadline.find({
            ...caseFilter,
            status: 'Pending',
            deadline_date: { $gte: now, $lte: in7Days }
        }).populate('case_id', 'case_number case_title').sort('deadline_date');

        const overdue = await CaseDeadline.find({
            ...caseFilter,
            status: 'Pending',
            deadline_date: { $lt: now }
        }).populate('case_id', 'case_number case_title').sort('deadline_date');

        res.json({ upcoming, overdue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a deadline
// @route   POST /api/cases/:id/deadlines
// @access  Private (Admin, Lawyer)
const createDeadline = async (req, res) => {
    try {
        const { deadline_title, deadline_date, description } = req.body;

        const deadline = await CaseDeadline.create({
            case_id: req.params.id,
            deadline_title,
            deadline_date,
            description,
            created_by: req.user.id
        });

        const parentCase = await Case.findById(req.params.id);

        res.status(201).json(deadline);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a deadline
// @route   PUT /api/deadlines/:id
// @access  Private (Admin, Lawyer)
const updateDeadline = async (req, res) => {
    try {
        const deadline = await CaseDeadline.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!deadline) {
            return res.status(404).json({ message: 'Deadline not found' });
        }

        const parentCase = await Case.findById(deadline.case_id);

        res.json(deadline);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a deadline
// @route   DELETE /api/deadlines/:id
// @access  Private (Admin, Lawyer)
const deleteDeadline = async (req, res) => {
    try {
        const deadline = await CaseDeadline.findByIdAndDelete(req.params.id);

        if (!deadline) {
            return res.status(404).json({ message: 'Deadline not found' });
        }

        res.json({ message: 'Deadline removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDeadlines, getUpcomingDeadlines, createDeadline, updateDeadline, deleteDeadline };
