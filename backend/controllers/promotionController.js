const Promotion = require('../models/Promotion');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const path = require('path');

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

    // Send emails to all registered users (Asynchronously)
    const sendPromoEmails = async () => {
        try {
            const users = await User.find({ email: { $exists: true } }).select('email');
            const logoPath = path.join(__dirname, '../../frontend/public/logo.png');
            
            const htmlContent = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e5ead7; border-radius: 24px; text-align: center; background-color: #fafbf5;">
                    <img src="cid:logo" alt="Royal Hotel" style="width: 120px; margin-bottom: 30px;">
                    <h1 style="color: #2c332b; font-size: 28px; font-weight: 800; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">${title}</h1>
                    <p style="color: #667064; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">${description}</p>
                    <div style="background: #a1bc98; color: white; display: inline-block; padding: 12px 30px; border-radius: 40px; font-size: 22px; font-weight: 900; margin-bottom: 30px; letter-spacing: 1px;">${discountPercentage}% OFF</div>
                    ${couponCode ? `<div style="margin-bottom: 25px;"><div style="border: 2px dashed #a1bc98; padding: 12px 24px; display: inline-block; font-weight: 800; color: #2c332b; font-size: 18px; letter-spacing: 1px;">USE CODE: <strong>${couponCode}</strong></div></div>` : ''}
                    <br>
                    <a href="${process.env.FRONTEND_URL}/hotels" style="background-color: #2c332b; color: #ffffff !important; padding: 18px 40px; text-decoration: none; border-radius: 40px; font-weight: 800; display: inline-block; font-size: 16px; letter-spacing: 1px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">BOOK NOW</a>
                    <p style="margin-top: 40px; font-size: 12px; color: #a1bc98; font-weight: 600;">&copy; 2026 Royal Hotel Bookings. All Luxury Stays. All rights reserved.</p>
                </div>
            `;

            for (const user of users) {
                try {
                    await sendEmail({
                        email: user.email,
                        subject: `Special Offer: ${title}`,
                        html: htmlContent,
                        attachments: [{
                            filename: 'logo.png',
                            path: logoPath,
                            cid: 'logo' // Internal reference for the HTML <img src="cid:logo">
                        }]
                    });
                } catch (err) {
                    console.error(`Failed to send promo email to ${user.email}:`, err.message);
                }
            }
        } catch (err) {
            console.error('Error fetching users for promo email:', err.message);
        }
    };

    // Run in background without awaiting to keep response fast
    sendPromoEmails();

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
