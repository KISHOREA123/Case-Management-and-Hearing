const { CaseDocument, DocumentFolder, Case } = require('../models');
const { createTimelineEntry } = require('./timelineController');

// @desc    Get all documents for a case
// @route   GET /api/docs/case/:caseId
// @access  Private
const getCaseDocuments = async (req, res) => {
    try {
        const docs = await CaseDocument.find({ case_id: req.params.caseId }).populate('uploaded_by', 'name');
        const folders = await DocumentFolder.find({ case_id: req.params.caseId });
        res.json({ docs, folders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a document
// @route   POST /api/docs/upload
// @access  Private
const uploadDocument = async (req, res) => {
    try {
        const { case_id, folder_id, file_name, file_url } = req.body;

        const doc = await CaseDocument.create({
            case_id,
            folder_id: folder_id || null,
            file_name,
            file_url,
            uploaded_by: req.user.id
        });

        await createTimelineEntry(case_id, 'Document Uploaded', `Document "${file_name}" uploaded by ${req.user.name}`, req.user.id);

        const parentCase = await Case.findById(case_id);

        res.status(201).json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a folder
// @route   POST /api/docs/folders
// @access  Private
const createFolder = async (req, res) => {
    try {
        const { case_id, folder_name } = req.body;
        const folder = await DocumentFolder.create({ case_id, folder_name });
        res.status(201).json(folder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a document
// @route   DELETE /api/docs/:id
// @access  Private
const deleteDocument = async (req, res) => {
    try {
        const doc = await CaseDocument.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const parentCase = await Case.findById(doc.case_id);
        const fileName = doc.file_name;

        await doc.deleteOne();

        res.json({ message: 'Document removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCaseDocuments,
    uploadDocument,
    createFolder,
    deleteDocument
};
