const { Hearing, Case, Client, HearingNote } = require('../models');
const { createTimelineEntry } = require('./timelineController');

// @desc    Get all hearings
// @route   GET /api/hearings
// @access  Private
const getHearings = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'lawyer') {
            const cases = await Case.find({ lawyer_id: req.user.id }).select('_id');
            const caseIds = cases.map(c => c._id);
            query.case_id = { $in: caseIds };
        } else if (req.user.role === 'client') {
            const client = await Client.findOne({ user_id: req.user.id });
            if (client && client.related_case_id) {
                query.case_id = client.related_case_id;
            } else {
                return res.json([]);
            }
        }

        const hearings = await Hearing.find(query)
            .populate({
                path: 'case_id',
                select: 'case_title case_number'
            })
            .sort('hearing_date hearing_time');

        res.json(hearings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a hearing
// @route   POST /api/hearings
// @access  Private (Admin, Lawyer)
const createHearing = async (req, res) => {
    try {
        const hearing = await Hearing.create(req.body);

        await createTimelineEntry(req.body.case_id, 'Hearing Scheduled', `New hearing scheduled for ${new Date(req.body.hearing_date).toLocaleDateString()} at ${req.body.hearing_time}`, req.user.id);

        const parentCase = await Case.findById(req.body.case_id);

        res.status(201).json(hearing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a hearing
// @route   PUT /api/hearings/:id
// @access  Private (Admin, Lawyer)
const updateHearing = async (req, res) => {
    try {
        const oldHearing = await Hearing.findById(req.params.id);
        const oldStatus = oldHearing ? oldHearing.status : null;

        const hearing = await Hearing.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (req.body.status === 'Completed' && oldStatus !== 'Completed') {
            await createTimelineEntry(hearing.case_id, 'Hearing Completed', `Hearing on ${new Date(hearing.hearing_date).toLocaleDateString()} marked as completed`, req.user.id);
        }

        const parentCase = await Case.findById(hearing.case_id);

        res.json(hearing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a hearing
// @route   DELETE /api/hearings/:id
// @access  Private (Admin, Lawyer)
const deleteHearing = async (req, res) => {
    try {
        const hearing = await Hearing.findByIdAndDelete(req.params.id);

        if (!hearing) {
            return res.status(404).json({ message: 'Hearing not found' });
        }

        const parentCase = await Case.findById(hearing.case_id);

        res.json({ message: 'Hearing removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get notes for a hearing
// @route   GET /api/hearings/:id/notes
// @access  Private
const getHearingNotes = async (req, res) => {
    try {
        const notes = await HearingNote.find({ hearing_id: req.params.id }).populate('created_by', 'name');
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a note to a hearing
// @route   POST /api/hearings/:id/notes
// @access  Private (Admin, Lawyer)
const addHearingNote = async (req, res) => {
    try {
        const { note } = req.body;
        const hearingNote = await HearingNote.create({
            hearing_id: req.params.id,
            note,
            created_by: req.user.id
        });

        const hearing = await Hearing.findById(req.params.id);
        if (hearing) {
            await createTimelineEntry(hearing.case_id, 'Lawyer Comment Added', `New note added to hearing on ${new Date(hearing.hearing_date).toLocaleDateString()}`, req.user.id);
        }

        res.status(201).json(hearingNote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getHearings,
    createHearing,
    updateHearing,
    deleteHearing,
    getHearingNotes,
    addHearingNote
};
