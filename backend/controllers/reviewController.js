const Review = require('../models/Review');
const Hotel = require('../models/Hotel');

// @desc Add a review for a hotel
// @route POST /api/reviews
exports.addReview = async (req, res) => {
    const { hotelId, rating, comment } = req.body;

    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        const review = await Review.create({
            user: req.user._id,
            hotel: hotelId,
            rating,
            comment
        });

        // Update hotel rating
        const reviews = await Review.find({ hotel: hotelId });
        hotel.numReviews = reviews.length;
        hotel.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await hotel.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get reviews for a hotel
// @route GET /api/reviews/:hotelId
exports.getHotelReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ hotel: req.params.hotelId }).populate('user', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc Get reviews for manager's hotels
// @route GET /api/reviews/manager/all
exports.getManagerReviews = async (req, res) => {
    try {
        const hotels = await Hotel.find({ manager: req.user._id });
        const hotelIds = hotels.map(h => h._id);
        const reviews = await Review.find({ hotel: { $in: hotelIds } })
            .populate('user', 'name')
            .populate('hotel', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
