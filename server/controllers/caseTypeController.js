const { CaseType } = require('../models');

const getCaseTypes = async (req, res) => {
    try {
        const types = await CaseType.find();
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCaseType = async (req, res) => {
    try {
        const type = await CaseType.create(req.body);
        res.status(201).json(type);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCaseType = async (req, res) => {
    try {
        const type = await CaseType.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!type) {
            return res.status(404).json({ message: 'Case type not found' });
        }
        res.json(type);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCaseType = async (req, res) => {
    try {
        const type = await CaseType.findByIdAndDelete(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Case type not found' });
        }
        res.json({ message: 'Case type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCaseTypes, createCaseType, updateCaseType, deleteCaseType };
