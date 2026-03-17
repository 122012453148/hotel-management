const User = require('../models/User');
const Hotel = require('../models/Hotel');

// @desc    Toggle hotel in wishlist
// @route   POST /api/wishlist/toggle/:hotelId
// @access  Private
exports.toggleWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const hotelId = req.params.hotelId;

        const isWishlisted = user.wishlist.includes(hotelId);

        if (isWishlisted) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== hotelId);
            await user.save();
            res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
        } else {
            user.wishlist.push(hotelId);
            await user.save();
            res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
