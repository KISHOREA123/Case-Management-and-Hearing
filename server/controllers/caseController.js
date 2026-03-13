const { Case, Client, Hearing, HearingNote, Invoice, CaseDocument, DocumentFolder, CaseTimeline, Conversation, Message, Notification } = require('../models');
const CaseDeadline = require('../models/CaseDeadline');
const { createTimelineEntry } = require('./timelineController');

// @desc    Get all cases
// @route   GET /api/cases
// @access  Private
const getCases = async (req, res) => {
    try {
        let query = {};

        // RBAC filtering
        if (req.user.role === 'lawyer') {
            query.lawyer_id = req.user.id;
        } else if (req.user.role === 'client') {
            const client = await Client.findOne({ user_id: req.user.id });
            if (client && client.related_case_id) {
                query._id = client.related_case_id;
            } else {
                return res.status(200).json([]);
            }
        }

        const cases = await Case.find(query)
            .populate('lawyer_id', 'name email')
            .populate('case_type_id')
            .populate('court_id')
            .sort('-createdAt');

        res.json(cases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single case
// @route   GET /api/cases/:id
// @access  Private
const getCaseById = async (req, res) => {
    try {
        const caseItem = await Case.findById(req.params.id)
            .populate('lawyer_id', 'name email')
            .populate('case_type_id')
            .populate('court_id')
            .populate('hearings');

        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // RBAC check
        if (req.user.role === 'lawyer') {
            const isAssigned = caseItem.lawyer_id && (
                caseItem.lawyer_id._id
                    ? caseItem.lawyer_id._id.toString() === req.user.id.toString()
                    : caseItem.lawyer_id.toString() === req.user.id.toString()
            );

            if (!isAssigned) {
                return res.status(403).json({ message: 'Not authorized to view this case' });
            }
        }

        if (req.user.role === 'client') {
            const client = await Client.findOne({ user_id: req.user.id });
            if (!client || !client.related_case_id || client.related_case_id.toString() !== caseItem._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this case' });
            }
        }

        res.json(caseItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a case
// @route   POST /api/cases
// @access  Private (Admin, Lawyer)
const createCase = async (req, res) => {
    try {
        const {
            case_title,
            case_type_id,
            petitioner,
            defender,
            court_id,
            filing_date,
            description,
            lawyer_id,
            priority
        } = req.body;

        // Auto-generate unique case number: CMH-YYYY-XXXX
        const year = new Date().getFullYear();
        const totalCases = await Case.countDocuments();
        const seq = String(totalCases + 1).padStart(4, '0');
        const case_number = `CMH-${year}-${seq}`;

        const assignedLawyerId = req.user.role === 'admin' ? lawyer_id : req.user.id;

        console.log('[createCase] generated case_number:', case_number, '| title:', case_title);

        const newCase = await Case.create({
            case_title,
            case_number,
            case_type_id,
            lawyer_id: assignedLawyerId,
            petitioner,
            defender,
            court_id,
            filing_date,
            description,
            priority: priority || 'Medium'
        });

        // Log timeline
        await createTimelineEntry(newCase._id, 'Case Created', `Case ${case_number} created with status ${newCase.status}`, req.user.id);

        // Client auto-creation/update for both Petitioner and Defender
        const syncClient = async (name, role) => {
            let client = await Client.findOne({
                name: name,
                $or: [{ related_case_id: null }, { related_case_id: newCase._id }]
            });

            if (!client) {
                await Client.create({
                    name: name,
                    related_case_id: newCase._id,
                    assigned_lawyer: assignedLawyerId,
                    role: role
                });
            } else {
                client.related_case_id = newCase._id;
                client.assigned_lawyer = assignedLawyerId;
                client.role = role;
                await client.save();
            }
        };

        await Promise.all([
            syncClient(petitioner, 'Petitioner'),
            syncClient(defender, 'Defender')
        ]);

        res.status(201).json(newCase);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a case
// @route   PUT /api/cases/:id
// @access  Private (Admin, Lawyer)
const updateCase = async (req, res) => {
    try {
        let caseItem = await Case.findById(req.params.id);

        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        if (req.user.role === 'lawyer' && caseItem.lawyer_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const oldStatus = caseItem.status;

        caseItem = await Case.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Log status change
        if (req.body.status && req.body.status !== oldStatus) {
            await createTimelineEntry(caseItem._id, 'Case Status Updated', `Status changed from ${oldStatus} to ${req.body.status}`, req.user.id);
        }

        // Sync clients if petitioner or defender changed
        if (req.body.petitioner || req.body.defender) {
            const syncClient = async (name, role) => {
                if (!name) return;
                let client = await Client.findOne({
                    name: name,
                    $or: [{ related_case_id: null }, { related_case_id: caseItem._id }]
                });

                if (!client) {
                    await Client.create({
                        name: name,
                        related_case_id: caseItem._id,
                        assigned_lawyer: caseItem.lawyer_id,
                        role: role
                    });
                } else {
                    client.related_case_id = caseItem._id;
                    client.role = role;
                    await client.save();
                }
            };
            await Promise.all([
                syncClient(req.body.petitioner, 'Petitioner'),
                syncClient(req.body.defender, 'Defender')
            ]);
        }

        res.json(caseItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a case
// @route   DELETE /api/cases/:id
// @access  Private (Admin)
const deleteCase = async (req, res) => {
    try {
        const caseItem = await Case.findById(req.params.id);

        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        const caseId = req.params.id;

        // 1. Find all hearings for this case, then delete their notes
        const hearings = await Hearing.find({ case_id: caseId }).select('_id');
        const hearingIds = hearings.map(h => h._id);
        await HearingNote.deleteMany({ hearing_id: { $in: hearingIds } });

        // 2. Find all conversations and delete their messages
        const conversations = await Conversation.find({ case_id: caseId }).select('_id');
        const convIds = conversations.map(c => c._id);
        await Message.deleteMany({ conversation_id: { $in: convIds } });

        // 3. Cascade delete all directly related records
        await Promise.all([
            Hearing.deleteMany({ case_id: caseId }),
            Invoice.deleteMany({ case_id: caseId }),
            CaseDocument.deleteMany({ case_id: caseId }),
            DocumentFolder.deleteMany({ case_id: caseId }),
            CaseTimeline.deleteMany({ case_id: caseId }),
            CaseDeadline.deleteMany({ case_id: caseId }),
            Conversation.deleteMany({ case_id: caseId }),
            Notification.deleteMany({ reference_id: caseId }),
            // Delete clients that belong to this case
            Client.deleteMany({ related_case_id: caseId })
        ]);

        // 4. Finally delete the case itself
        await Case.findByIdAndDelete(caseId);

        res.json({ message: 'Case and all related data removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCases,
    getCaseById,
    createCase,
    updateCase,
    deleteCase
};
