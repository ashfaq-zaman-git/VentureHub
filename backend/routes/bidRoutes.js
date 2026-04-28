const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/bids
// @desc    Submit a bid (Term Sheet)
// @access  Private (Investors)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { pitchId, bidAmount, equityRequested, termsAndConditions } = req.body;
        const investorId = req.user.id; // Extracted from JWT token via authMiddleware

        // Basic validation
        if (!pitchId || !bidAmount || !equityRequested) {
            return res.status(400).json({ message: "Please provide all required bid fields" });
        }

        // Create new bid instance
        const newBid = new Bid({
            pitchId,
            investorId,
            offerAmount: Number(bidAmount),
            offerEquity: Number(equityRequested),
            termsAndConditions
        });

        // Save to database
        const savedBid = await newBid.save();
        res.status(201).json(savedBid);

    } catch (error) {
        console.error("Error creating bid:", error);
        res.status(500).json({ message: "Server error creating bid" });
    }
});

// @route   GET /api/bids/my-bids
// @desc    Get all bids submitted by the current investor
// @access  Private (Investors)
router.get('/my-bids', authMiddleware, async (req, res) => {
    try {
        const bids = await Bid.find({ investorId: req.user.id })
            .populate('pitchId', 'title category')
            .sort({ createdAt: -1 });

        res.json(bids);
    } catch (error) {
        console.error("Error fetching my bids:", error);
        res.status(500).json({ message: "Server error fetching your bids" });
    }
});

// @route   GET /api/bids/pitch/:pitchId
// @desc    Get all bids for a specific pitch
// @access  Private (Typically the Entrepreneur who owns the pitch)
router.get('/pitch/:pitchId', authMiddleware, async (req, res) => {
    try {
        const bids = await Bid.find({ pitchId: req.params.pitchId })
            .populate('investorId', 'name')
            .sort({ createdAt: -1 });

        res.json(bids);
    } catch (error) {
        console.error("Error fetching bids for pitch:", error);
        res.status(500).json({ message: "Server error fetching bids" });
    }
});

// @route   PUT /api/bids/:id/counter
// @desc    Counter-offer a bid (Entrepreneur)
// @access  Private
router.put('/:id/counter', authMiddleware, async (req, res) => {
    try {
        const { counterAmount, counterEquity, counterTerms } = req.body;
        const bid = await Bid.findById(req.params.id);

        if (!bid) return res.status(404).json({ message: "Bid not found" });

        // Logic to verify if current user is the pitch owner could be added here

        bid.status = 'Countered';
        bid.counterAmount = Number(counterAmount);
        bid.counterEquity = Number(counterEquity);
        bid.counterTerms = counterTerms;

        await bid.save();
        res.json(bid);
    } catch (error) {
        console.error("Error countering bid:", error);
        res.status(500).json({ message: "Server error countering bid" });
    }
});

// @route   PUT /api/bids/:id/respond
// @desc    Accept or Reject a counter-offer (Investor)
// @access  Private
router.put('/:id/respond', authMiddleware, async (req, res) => {
    try {
        const { decision } = req.body; // 'Accepted' or 'Rejected'
        const bid = await Bid.findById(req.params.id);

        if (!bid) return res.status(404).json({ message: "Bid not found" });
        if (bid.investorId.toString() !== req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        bid.status = decision;
        if (decision === 'Accepted' && bid.counterAmount) {
            // Update the main offer with the accepted counter values
            bid.offerAmount = bid.counterAmount;
            bid.offerEquity = bid.counterEquity;
            bid.termsAndConditions = bid.counterTerms;
        }

        await bid.save();
        res.json(bid);
    } catch (error) {
        console.error("Error responding to bid:", error);
        res.status(500).json({ message: "Server error responding to bid" });
    }
});

module.exports = router;
