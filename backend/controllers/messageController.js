const Message = require('../models/Message');

// @desc    Get messages for a booking
// @route   GET /api/messages/:bookingId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ booking: req.params.bookingId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    const { bookingId, receiverId, content } = req.body;
    try {
        const message = await Message.create({
            booking: bookingId,
            sender: req.user._id,
            receiver: receiverId,
            content
        });

        // Emit socket event for real-time delivery
        const io = req.app.get('socketio');
        io.to(receiverId).emit('newMessage', {
            ...message._doc,
            sender: { _id: req.user._id, name: req.user.name }
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
