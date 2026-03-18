const express = require('express');
const router = express.Router();
const { 
    createPromotion, 
    getActivePromotions, 
    getHotelPromotions, 
    getMyPromotions, 
    deletePromotion 
} = require('../controllers/promotionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getActivePromotions);
router.get('/hotel/:hotelId', getHotelPromotions);

// Protected routes
router.use(protect);
router.get('/my-promotions', authorize('admin', 'manager'), getMyPromotions);
router.post('/', authorize('admin', 'manager'), createPromotion);
router.delete('/:id', authorize('admin', 'manager'), deletePromotion);

module.exports = router;
