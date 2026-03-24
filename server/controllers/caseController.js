const { Case, Client, Hearing, HearingNote, Invoice, CaseDocument, DocumentFolder, CaseTimeline, Conversation, Message, Notification, AccessRequest, User } = require('../models');
const CaseDeadline = require('../models/CaseDeadline');
const { createTimelineEntry } = require('./timelineController');

// @desc    Get all cases
// @route   GET /api/cases
// @access  Private
const getCases = async (req, res) => {
    try {
        let query = {};

        const userRole = req.user.role?.toLowerCase().trim();
        console.log(`[getCases] User ${req.user.id} has role: "${userRole}"`);

        // RBAC filtering
        if (userRole === 'lawyer') {
            query.lawyer_id = req.user.id;
        } else if (userRole === 'client') {
            // Find approved access requests for this user
            const approvedRequests = await AccessRequest.find({
                client_id: req.user.id,
                status: 'Approved'
            }).select('case_id');

            const allowedCaseIds = approvedRequests.map(r => r.case_id);
            console.log(`[getCases] Client ${req.user.id} has ${allowedCaseIds.length} approved cases`);
            
            if (allowedCaseIds.length === 0) {
                console.log('[getCases] No approved cases found for client, returning empty array');
                return res.status(200).json([]);
            }
            query._id = { $in: allowedCaseIds };
        } else if (userRole !== 'admin') {
            // If not admin, lawyer or client, they shouldn't see anything
            console.log(`[getCases] Unknown role "${userRole}", returning empty array`);
            return res.status(200).json([]);
        }

        console.log(`[getCases] Final Query: ${JSON.stringify(query)}`);

        const cases = await Case.find(query)
            .populate('lawyer_id', 'name email ' + (req.user.role === 'admin' ? 'phone' : ''))
            .populate('case_type_id')
            .populate('court_id')
            .sort('-createdAt');

        res.json(cases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search case by number (Publicly available for logged in users)
// @route   GET /api/cases/search/:number
// @access  Private
const searchCaseByNumber = async (req, res) => {
    try {
        const { number } = req.params;
        console.log(`[searchCaseByNumber] Searching for: ${number}`);
        
        // Use case-insensitive regex for exact match
        const caseItem = await Case.findOne({ 
            case_number: { $regex: new RegExp(`^${number.trim()}$`, 'i') } 
        })
            .select('case_number case_title lawyer_id'); // Only select minimal fields

        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // Check if user already has access or a pending request
        const existingRequest = await AccessRequest.findOne({
            client_id: req.user.id,
            case_id: caseItem._id
        });

        res.json({
            _id: caseItem._id,
            case_number: caseItem.case_number,
            lawyer_id: caseItem.lawyer_id,
            requestStatus: existingRequest ? existingRequest.status : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request access to a case
// @route   POST /api/cases/request-access
// @access  Private (Client)
const requestAccess = async (req, res) => {
    try {
        const { caseId } = req.body;

        const caseItem = await Case.findById(caseId);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // Check for existing request
        const existingRequest = await AccessRequest.findOne({
            client_id: req.user.id,
            case_id: caseId
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Request already exists' });
        }

        const request = await AccessRequest.create({
            client_id: req.user.id,
            case_id: caseId,
            lawyer_id: caseItem.lawyer_id,
            status: 'Pending',
            client_details: {
                name: req.user.name,
                phone: req.user.phone
            }
        });

        // Notify lawyer
        await Notification.create({
            user_id: caseItem.lawyer_id,
            title: 'New Case Access Request',
            message: `Client ${req.user.name} (${req.user.phone}) requested access to case ${caseItem.case_number}.`,
            type: 'access_request'
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get access requests for lawyer
// @route   GET /api/cases/access-requests
// @access  Private (Lawyer, Admin)
const getAccessRequests = async (req, res) => {
    try {
        let query = { status: 'Pending' };
        if (req.user.role === 'lawyer') {
            query.lawyer_id = req.user.id;
        }

        const requests = await AccessRequest.find(query)
            .populate('client_id', 'name email phone')
            .populate('case_id', 'case_number case_title')
            .sort('-createdAt');

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Handle access request (Approve/Reject)
// @route   PUT /api/cases/access-requests/:id
// @access  Private (Lawyer, Admin)
const handleAccessRequest = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await AccessRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Permissions check
        if (req.user.role === 'lawyer' && request.lawyer_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        request.status = status;
        await request.save();

        // Notify client
        await Notification.create({
            user_id: request.client_id,
            title: `Case Access ${status}`,
            message: `Your request for access to case has been ${status.toLowerCase()}.`,
            type: 'access_response'
        });

        res.json(request);
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
            const approvedAccess = await AccessRequest.findOne({
                client_id: req.user.id,
                case_id: caseItem._id,
                status: 'Approved'
            });
            if (!approvedAccess) {
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
    deleteCase,
    searchCaseByNumber,
    requestAccess,
    getAccessRequests,
    handleAccessRequest
};
