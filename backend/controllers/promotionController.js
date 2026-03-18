const Promotion = require('../models/Promotion');
const Hotel = require('../models/Hotel');
const User = require('../models/User');

// Note: Nodemailer logic is mocked for the sake of simplicity unless specifically requested
// const sendEmail = require('../utils/sendEmail');

// @desc    Create a promotion
// @route   POST /api/promotions
// @access  Private (Admin/Manager)
exports.createPromotion = async (req, res) => {
  try {
    const { title, description, discountPercentage, validFrom, validTo, applicableHotels, couponCode } = req.body;

    // Validation for Manager
    if (req.user.role === 'manager') {
      if (!applicableHotels || applicableHotels.length === 0) {
        return res.status(400).json({ message: 'Managers cannot create global promotions. Please specify your hotels.' });
      }

      // Verify manager owns these hotels
      const managerHotels = await Hotel.find({ manager: req.user._id }).select('_id');
      const managerHotelIds = managerHotels.map(h => h._id.toString());
      
      const isAuthorized = applicableHotels.every(id => managerHotelIds.includes(id.toString()));
      if (!isAuthorized) {
        return res.status(403).json({ message: 'You can only create promotions for your own hotels.' });
      }
    }

    const promotion = await Promotion.create({
      title,
      description,
      discountPercentage,
      validFrom,
      validTo,
      applicableHotels: req.user.role === 'admin' ? (applicableHotels || []) : applicableHotels,
      couponCode,
      createdBy: req.user._id,
      role: req.user.role
    });

    res.status(201).json({ success: true, promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active promotions (landing page)
// @route   GET /api/promotions
// @access  Public
exports.getActivePromotions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const promotions = await Promotion.find({
      isActive: true,
      validFrom: { $lte: endOfDay },
      validTo: { $gte: today }
    }).populate('applicableHotels', 'name location images');

    res.status(200).json({ success: true, count: promotions.length, promotions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get promotions for a specific hotel
// @route   GET /api/promotions/hotel/:hotelId
// @access  Public
exports.getHotelPromotions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Allow seeing hotel-specific promos and global promos
    const promotions = await Promotion.find({
      isActive: true,
      validFrom: { $lte: endOfDay },
      validTo: { $gte: today },
      $or: [
        { applicableHotels: { $size: 0 } }, // Global promotions
        { applicableHotels: req.params.hotelId } // Hotel specific promotions
      ]
    });

    res.status(200).json({ success: true, promotions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all promotions created by current user (for manager/admin dashboard)
// @route   GET /api/promotions/my-promotions
// @access  Private
exports.getMyPromotions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      query.createdBy = req.user._id;
    }
    const promotions = await Promotion.find(query).populate('applicableHotels', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, promotions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
    
    if (req.user.role === 'manager' && promotion.createdBy.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    await promotion.remove();
    res.status(200).json({ success: true, message: 'Promotion deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
