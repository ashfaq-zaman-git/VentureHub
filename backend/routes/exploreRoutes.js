const express = require('express');
const router = express.Router();
const SavedSearch = require('../models/SavedSearch');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/explore/save-search
// @desc    Save a search criteria for notifications
// @access  Private
router.post('/save-search', authMiddleware, async (req, res) => {
    try {
        const { category, minAsk, maxAsk, tag } = req.body;
        const userId = req.user.id;

        const newSavedSearch = new SavedSearch({
            userId,
            category,
            minAsk: minAsk ? Number(minAsk) : undefined,
            maxAsk: maxAsk ? Number(maxAsk) : undefined,
            tag
        });

        const saved = await newSavedSearch.save();
        res.status(201).json(saved);
    } catch (error) {
        console.error('Error saving search:', error);
        res.status(500).json({ message: 'Server Error saving search' });
    }
});

// @route   GET /api/explore/saved-searches
// @desc    Get user's saved searches
// @access  Private
router.get('/saved-searches', authMiddleware, async (req, res) => {
    try {
        const savedSearches = await SavedSearch.find({ userId: req.user.id });
        res.json(savedSearches);
    } catch (error) {
        console.error('Error fetching saved searches:', error);
        res.status(500).json({ message: 'Server Error fetching saved searches' });
    }
});

module.exports = router;
