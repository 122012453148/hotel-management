const express = require('express');
const router = express.Router();
const { addReview, getHotelReviews, getManagerReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addReview);

router.get('/manager/all', protect, authorize('manager', 'admin'), getManagerReviews);
router.get('/:hotelId', getHotelReviews);

module.exports = router;
