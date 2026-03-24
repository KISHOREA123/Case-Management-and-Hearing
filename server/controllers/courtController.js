const { Court } = require('../models');

const getCourts = async (req, res) => {
    try {
        const courts = await Court.find();
        res.json(courts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCourt = async (req, res) => {
    try {
        const court = await Court.create(req.body);
        res.status(201).json(court);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCourts, createCourt };
