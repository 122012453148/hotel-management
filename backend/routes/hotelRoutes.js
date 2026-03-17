const express = require('express');
const router = express.Router();
const { 
    createHotel, 
    getHotels, 
    getHotelById, 
    updateHotel, 
    deleteHotel,
    getRecommendations,
    getLocations,
    getManagerHotels
} = require('../controllers/hotelController');
const { protect, authorize } = require('../middleware/authMiddleware');
const optionalProtect = (req, res, next) => {
    // Custom middleware to handle optional auth
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        return protect(req, res, next);
    }
    next();
};

router.get('/recommendations', optionalProtect, getRecommendations);
router.get('/locations', getLocations);
router.get('/my-hotels', protect, authorize('manager', 'admin'), getManagerHotels);

router.route('/')
    .get(getHotels)
    .post(protect, authorize('manager', 'admin'), createHotel);

router.route('/:id')
    .get(getHotelById)
    .put(protect, authorize('manager', 'admin'), updateHotel)
    .delete(protect, authorize('manager', 'admin'), deleteHotel);

module.exports = router;
