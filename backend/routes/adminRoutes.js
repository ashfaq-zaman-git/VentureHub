const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');

// @route   GET /api/admin/kyc-pending
// @desc    Get all users with pending KYC status
// @access  Private/Admin
router.get('/kyc-pending', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // Search for users who have either a pending video OR pending documents
        const pendingUsers = await User.find({ 
            $or: [
                { verificationStatus: 'pending' }, 
                { 'kycDocuments.status': 'pending' }
            ] 
        }).select('-password');
        res.json(pendingUsers);
    } catch (error) {
        console.error('Error fetching pending KYC:', error);
        res.status(500).json({ message: 'Server Error fetching pending KYC users' });
    }
});

// @route   PUT /api/admin/kyc-review/:userId
// @desc    Approve or reject a KYC video
// @access  Private/Admin
router.put('/kyc-review/:userId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update both the old video status and the new document status
        user.verificationStatus = status;
        if (user.kycDocuments) {
            user.kycDocuments.status = status;
        }

        if (status === 'rejected') {
            user.isVerified = false;
        } else if (status === 'approved') {
            // If the admin approves, they are approved but still need to pay the fee to be 'isVerified'
            user.isVerified = false;
        }

        await user.save();

        res.json({ message: `User KYC ${status} successfully`, user: { id: user.id, name: user.name, verificationStatus: user.verificationStatus, isVerified: user.isVerified } });
    } catch (error) {
        console.error('Error reviewing KYC:', error);
        res.status(500).json({ message: 'Server Error processing KYC review' });
    }
});

module.exports = router;
