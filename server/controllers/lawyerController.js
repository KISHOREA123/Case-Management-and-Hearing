const { User, Case } = require('../models');

// @desc    Get all lawyers with their case counts
// @route   GET /api/lawyers
// @access  Private (Admin)
const getLawyers = async (req, res) => {
    try {
        const lawyers = await User.find({ role: 'lawyer' }).select('name email phone');

        // Enhance lawyers with case counts
        const lawyersWithCounts = await Promise.all(lawyers.map(async (lawyer) => {
            const caseCount = await Case.countDocuments({ lawyer_id: lawyer._id });
            return {
                ...lawyer.toObject(),
                caseCount
            };
        }));

        res.json(lawyersWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLawyers };
