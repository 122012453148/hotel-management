const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const { notifyAdmins } = require('../utils/notificationUtils');

// @desc Create a new hotel
// @route POST /api/hotels
// @access Private (Manager)
exports.createHotel = async (req, res) => {
    const { name, location, city, address, zipCode, description, amenities, images, extraServices } = req.body;

    try {
        const hotel = await Hotel.create({
            name,
            location,
            city,
            address,
            zipCode,
            description,
            amenities,
            images,
            extraServices,
            manager: req.user._id,
            isApproved: false // Always require explicit approval
        });

        // Always notify admins about new hotel submissions
        await notifyAdmins(req.app, {
            title: 'New Hotel Submission',
            message: `${req.user.role === 'admin' ? 'Admin' : 'Manager'} ${req.user.name} has submitted a new hotel: ${name}`,
            type: 'info',
            link: '/admin?tab=hotels'
        });

        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get manager's hotels (approved + pending)
// @route GET /api/hotels/my-hotels
// @access Private (Manager)
exports.getManagerHotels = async (req, res) => {
    try {
        // Return ALL hotels for this manager (approved and pending)
        // so they can see pending submissions in their dashboard
        const hotels = await Hotel.find({ manager: req.user._id });
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all hotels (with advanced search and filters)
// @route GET /api/hotels
// @access Public
exports.getHotels = async (req, res) => {
    const { location, rating, minPrice, maxPrice, amenities, checkIn, checkOut } = req.query;

    // Always start with the approval gate — only show approved hotels to customers
    let query = { isApproved: true };

    if (location && location.trim() !== '') {
        // Extract only the city name (first keyword before the comma)
        // e.g. "Thanjavur, Tamil Nadu, India" => search term is "Thanjavur"
        const cityKeyword = location.split(',')[0].trim();
        // Wrap with $and so isApproved:true is NEVER overridden by $or
        query = {
            $and: [
                { isApproved: true },
                {
                    $or: [
                        { location: { $regex: cityKeyword, $options: 'i' } },
                        { city:     { $regex: cityKeyword, $options: 'i' } },
                        { address:  { $regex: cityKeyword, $options: 'i' } },
                        { name:     { $regex: cityKeyword, $options: 'i' } }
                    ]
                }
            ]
        };
    }

    if (rating && rating.trim() !== '') {
        query.rating = { $gte: Number(rating) };
    }

    if (amenities && amenities.trim() !== '') {
        const amenitiesArray = amenities.split(',').map(a => a.trim());
        // Use $all with regex for case-insensitive matching of each amenity
        query.amenities = { 
            $all: amenitiesArray.map(a => new RegExp(`^${a}$`, 'i')) 
        };
    }

    try {
        console.log('Hotel Query:', JSON.stringify(query));
        let hotels = await Hotel.find(query);
        console.log(`Found ${hotels.length} approved hotels matching query.`);

        // Filter by price and availability if requested
        // This requires checking rooms for each hotel
        const filteredHotels = [];

        for (const hotel of hotels) {
            const roomsQuery = { hotel: hotel._id };
            
            if ((minPrice && minPrice.trim() !== '') || (maxPrice && maxPrice.trim() !== '')) {
                roomsQuery.price = {};
                if (minPrice && minPrice.trim() !== '') roomsQuery.price.$gte = Number(minPrice);
                if (maxPrice && maxPrice.trim() !== '') roomsQuery.price.$lte = Number(maxPrice);
            }

            const rooms = await Room.find(roomsQuery);
            
            if (rooms.length > 0) {
                // If date filters are provided, we should check availability
                // For simplicity, we check if any room is not fully booked
                // A more robust system would check specific Booking dates
                const availableRooms = rooms.filter(room => room.occupiedRooms < room.totalRooms);
                
                if (availableRooms.length > 0) {
                    // Add minPrice of available rooms to hotel object for frontend
                    const hotelObj = hotel.toObject();
                    hotelObj.minPrice = Math.min(...availableRooms.map(r => r.price || 120));
                    filteredHotels.push(hotelObj);
                }
            }
        }

        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 6;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = filteredHotels.slice(startIndex, endIndex);

        res.json({
            hotels: results,
            page,
            pages: Math.ceil(filteredHotels.length / limit),
            total: filteredHotels.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get unique hotel locations for auto-suggestion
// @route GET /api/hotels/locations
exports.getLocations = async (req, res) => {
    try {
        const locations = await Hotel.distinct('location', { isApproved: true });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get hotel by ID
// @route GET /api/hotels/:id
// @access Public
exports.getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id).populate('manager', 'name email');
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        const rooms = await Room.find({ hotel: req.params.id });
        res.json({ hotel, rooms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update hotel
// @route PUT /api/hotels/:id
exports.updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        if (hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // If manager is updating, do NOT allow them to change isApproved
        const updateData = { ...req.body };
        if (req.user.role !== 'admin') {
            delete updateData.isApproved;
        }

        const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedHotel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete hotel
// @route DELETE /api/hotels/:id
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        if (hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await hotel.deleteOne();
        res.json({ message: 'Hotel removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get recommended hotels
// @route GET /api/hotels/recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;

        // 1. Get Top Rated & Popular Hotels
        const popularHotels = await Hotel.aggregate([
            { $match: { isApproved: true } },
            {
                $lookup: {
                    from: 'bookings',
                    localField: '_id',
                    foreignField: 'hotel',
                    as: 'bookingHistory'
                }
            },
            {
                $addFields: {
                    bookingCount: { $size: '$bookingHistory' }
                }
            },
            {
                $addFields: {
                    score: {
                        $add: [
                            { $multiply: [{ $ifNull: ['$rating', 0] }, 10] },
                            { $multiply: ['$bookingCount', 5] }
                        ]
                    }
                }
            },
            { $sort: { score: -1 } },
            { $limit: 10 }
        ]);

        let personalized = [];
        if (userId) {
            // Find user's past booking locations
            const userBookings = await Booking.find({ user: userId }).populate('hotel');
            const locations = [...new Set(userBookings.map(b => b.hotel?.location).filter(Boolean))];
            const bookedHotelIds = userBookings.map(b => b.hotel?._id.toString());

            if (locations.length > 0) {
                personalized = await Hotel.find({
                    location: { $in: locations },
                    isApproved: true,
                    _id: { $nin: bookedHotelIds }
                })
                .sort({ rating: -1 })
                .limit(5);
            }
        }

        const combined = [...personalized, ...popularHotels].filter(h => h && h._id);
        const uniqueHotels = Array.from(new Set(combined.map(h => h._id.toString())))
            .map(id => combined.find(h => h._id.toString() === id))
            .filter(Boolean)
            .slice(0, 6);

        res.json(uniqueHotels);
    } catch (error) {
        console.error('Recommendation Error:', error);
        res.status(500).json({ message: error.message });
    }
};
