const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    createBooking, 
    getMyBookings, 
    getAllBookings,
    cancelBooking,
    getBookingById,
    updatePaymentStatus,
    updateBookingStatus,
    generateInvoice,
    verifyQRCode,
    getAnalytics
} = require('../controllers/bookingController');

router.get('/analytics', protect, authorize('manager', 'admin'), getAnalytics);
router.put('/verify-qr/:qrCode', protect, authorize('manager', 'admin'), verifyQRCode);

router.route('/')
    .get(protect, authorize('manager', 'admin'), getAllBookings)
    .post(protect, createBooking);

router.get('/mybookings', protect, getMyBookings);
router.route('/:id')
    .get(protect, getBookingById)
    .delete(protect, cancelBooking);
router.put('/:id/pay', protect, updatePaymentStatus);
router.put('/:id/status', protect, authorize('manager', 'admin'), updateBookingStatus);
router.get('/:id/invoice', protect, generateInvoice);

module.exports = router;
