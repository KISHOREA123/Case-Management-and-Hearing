const { Conversation, Message, Case } = require('../models');

// @desc    Get or create conversation for a case
// @route   GET /api/chat/case/:caseId
// @access  Private
const getConversation = async (req, res) => {
    try {
        let conversation = await Conversation.findOne({ case_id: req.params.caseId });

        if (!conversation) {
            // Need to find participants (Lawyer and Client)
            // This logic can be refined, but for now we create it when first accessed
            conversation = await Conversation.create({
                case_id: req.params.caseId,
                participants: [req.user.id] // Participants will be updated as they join
            });
        }

        const messages = await Message.find({ conversation_id: conversation._id })
            .populate('sender_id', 'name email role')
            .sort('createdAt');

        res.json({ conversation, messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/chat/message
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { conversation_id, message, attachments } = req.body;

        const newMessage = await Message.create({
            conversation_id,
            sender_id: req.user.id,
            message,
            attachments: attachments || []
        });

        const conversation = await Conversation.findById(conversation_id);
        if (conversation && !conversation.participants.includes(req.user.id)) {
            conversation.participants.push(req.user.id);
            await conversation.save();
        }

        const parentCase = conversation ? await Case.findById(conversation.case_id) : null;

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getConversation,
    sendMessage
};
