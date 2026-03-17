const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// @desc Add a room to a hotel
// @route POST /api/rooms
exports.addRoom = async (req, res) => {
    const { hotel, roomType, price, capacity, totalRooms, amenities, images } = req.body;

    try {
        const hotelDoc = await Hotel.findById(hotel);
        if (!hotelDoc) return res.status(404).json({ message: 'Hotel not found' });

        if (hotelDoc.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const room = await Room.create({
            hotel,
            roomType,
            price,
            capacity,
            totalRooms,
            amenities,
            images
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get rooms for a specific hotel
// @route GET /api/rooms/hotel/:hotelId
exports.getHotelRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ hotel: req.params.hotelId });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update room details
// @route PUT /api/rooms/:id
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('hotel');
        if (!room) return res.status(404).json({ message: 'Room not found' });

        if (room.hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRoom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete room
// @route DELETE /api/rooms/:id
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('hotel');
        if (!room) return res.status(404).json({ message: 'Room not found' });

        if (room.hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await room.deleteOne();
        res.json({ message: 'Room removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
