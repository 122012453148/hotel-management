const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

const AuditLog = require('../models/AuditLog');
const PlatformSettings = require('../models/PlatformSettings');

const createAuditLog = async (adminId, action, details, targetId, targetModel) => {
    try {
        await AuditLog.create({
            admin: adminId,
            action,
            details,
            targetId,
            targetModel
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

// @desc Get analytics for admin dashboard
// ... existing getStats ...
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalHotels = await Hotel.countDocuments();
        const totalBookings = await Booking.countDocuments();
        
        const settings = await PlatformSettings.findOne() || { commissionRate: 10 };
        const commissionRate = settings.commissionRate / 100;

        const revenue = await Booking.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const totalRevenue = revenue[0]?.total || 0;
        const platformRevenue = totalRevenue * commissionRate;

        res.json({
            totalUsers,
            totalHotels,
            totalBookings,
            revenue: totalRevenue,
            platformRevenue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all pending hotels for approval
exports.getPendingHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({ isApproved: false }).populate('manager', 'name email');
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Notification = require('../models/Notification');

// @desc Approve or reject hotel
exports.approveHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        const isApproving = req.body.status === 'approve';
        hotel.isApproved = isApproving;
        await hotel.save();

        // Notify Manager
        const notification = await Notification.create({
            user: hotel.manager,
            title: `Hotel ${isApproving ? 'Approved' : 'Rejected'}`,
            message: `Your hotel "${hotel.name}" has been ${isApproving ? 'approved' : 'rejected'} by the admin.`,
            type: 'info',
            link: '/manager-dashboard'
        });

        // Emit socket event to manager
        const io = req.app.get('socketio');
        if (io) {
            io.to(hotel.manager.toString()).emit('newNotification', notification);
        }

        await createAuditLog(
            req.user._id,
            isApproving ? 'HOTEL_APPROVED' : 'HOTEL_REJECTED',
            `Admin ${isApproving ? 'approved' : 'rejected'} hotel: ${hotel.name}`,
            hotel._id,
            'Hotel'
        );

        res.json({ message: `Hotel ${isApproving ? 'approved' : 'rejected'} successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Block/Unblock user
exports.toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.isBlocked = !user.isBlocked;
        await user.save();
        
        await createAuditLog(
            req.user._id,
            user.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
            `Admin ${user.isBlocked ? 'blocked' : 'unblocked'} user: ${user.email}`,
            user._id,
            'User'
        );

        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const email = user.email;
        await user.deleteOne();

        await createAuditLog(
            req.user._id,
            'USER_DELETED',
            `Admin deleted user: ${email}`,
            req.params.id,
            'User'
        );

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all bookings for monitor
exports.getAllBookingsAdmin = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user', 'name email').populate('hotel', 'name location');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get detailed analytics
exports.getAnalytics = async (req, res) => {
    try {
        const monthlyRevenue = await Booking.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    total: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const hotelsPerMonth = await Hotel.aggregate([
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.json({ monthlyRevenue, hotelsPerMonth });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get platform settings
// @route GET /api/admin/settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await PlatformSettings.findOne();
        if (!settings) settings = await PlatformSettings.create({});
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update platform settings
// @route PUT /api/admin/settings
exports.updateSettings = async (req, res) => {
    try {
        const { commissionRate } = req.body;
        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create({ commissionRate });
        } else {
            settings.commissionRate = commissionRate;
            await settings.save();
        }

        await createAuditLog(
            req.user._id,
            'SETTINGS_UPDATED',
            `Admin updated platform commission rate to ${commissionRate}%`,
            settings._id,
            'PlatformSettings'
        );

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get audit logs
// @route GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().populate('admin', 'name email').sort('-createdAt').limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
