const { CaseTimeline } = require('../models');

// @desc    Add a timeline entry
// @access  Internal
const createTimelineEntry = async (caseId, eventType, description, userId) => {
    try {
        await CaseTimeline.create({
            case_id: caseId,
            event_type: eventType,
            description: description,
            created_by: userId
        });
    } catch (error) {
        console.error('Failed to create timeline entry:', error);
    }
};

// @desc    Get timeline for a case
// @route   GET /api/cases/:id/timeline
// @access  Private
const getCaseTimeline = async (req, res) => {
    try {
        const timeline = await CaseTimeline.find({ case_id: req.params.id })
            .populate('created_by', 'name role')
            .sort('-created_at');
        res.json(timeline);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTimelineEntry,
    getCaseTimeline
};
