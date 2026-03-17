const express = require('express');
const router = express.Router();
const { 
    getStats, 
    getPendingHotels, 
    approveHotel, 
    getAllUsers, 
    toggleBlockUser, 
    deleteUser, 
    getAllBookingsAdmin, 
    getAnalytics,
    getSettings,
    updateSettings,
    getAuditLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/pending-hotels', getPendingHotels);
router.put('/approve-hotel/:id', approveHotel);

router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

router.get('/bookings', getAllBookingsAdmin);
router.get('/analytics', getAnalytics);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
