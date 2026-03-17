const express = require('express');
const router = express.Router();
const { addRoom, getHotelRooms, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('manager', 'admin'), addRoom);
router.get('/hotel/:hotelId', getHotelRooms);
router.route('/:id')
    .put(protect, authorize('manager', 'admin'), updateRoom)
    .delete(protect, authorize('manager', 'admin'), deleteRoom);

module.exports = router;
