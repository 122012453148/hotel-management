const express = require('express');
const router = express.Router();
const { 
    getStats, 
    getPendingHotels, 
    getAllHotels,
    approveHotel, 
    toggleSuspendHotel,
    getAllUsers, 
    toggleBlockUser, 
    deleteUser, 
    getAllBookingsAdmin, 
    getAllPayments,
    getAnalytics,
    getSettings,
    updateSettings,
    getAllReviews,
    deleteReview,
    getAuditLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/pending-hotels', getPendingHotels);
router.get('/hotels', getAllHotels);
router.put('/approve-hotel/:id', approveHotel);
router.put('/hotels/:id/suspend', toggleSuspendHotel);

router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

router.get('/bookings', getAllBookingsAdmin);
router.get('/payments', getAllPayments);
router.get('/analytics', getAnalytics);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
