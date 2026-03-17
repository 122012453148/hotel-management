const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// @desc    Upload multiple images
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.array('images', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
    const urls = req.files.map(file => file.path);
    res.json(urls);
});

module.exports = router;
