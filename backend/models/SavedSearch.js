const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String
    },
    minAsk: {
        type: Number
    },
    maxAsk: {
        type: Number
    },
    tag: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
