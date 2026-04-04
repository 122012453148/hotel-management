const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const sendNotification = require('../utils/notificationUtil');

// @desc Create a new booking
// @route POST /api/bookings
// @access Private
exports.createBooking = async (req, res) => {
    const { hotel, room, checkIn, checkOut, totalPrice, guests, selectedExtras } = req.body;

    try {
        const selectedRoom = await Room.findById(room);
        if (!selectedRoom) return res.status(404).json({ message: 'Room not found' });

        if (selectedRoom.occupiedRooms >= selectedRoom.totalRooms) {
            return res.status(400).json({ message: 'Room is not available for selected dates' });
        }

        const booking = await Booking.create({
            user: req.user._id,
            hotel,
            room,
            checkIn,
            checkOut,
            totalPrice,
            guests,
            status: 'Pending',
            paymentStatus: 'Unpaid',
            selectedExtras: selectedExtras || [],
            qrCode: Math.random().toString(36).substring(2, 10).toUpperCase() // Simple unique code
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get booking by ID
// @route GET /api/bookings/:id
// @access Private
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('hotel room');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Allow: the booking's customer, the hotel's manager, or an admin
        const isBookingOwner = booking.user.toString() === req.user._id.toString();
        const isHotelManager = booking.hotel && booking.hotel.manager && booking.hotel.manager.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isBookingOwner && !isHotelManager && !isAdmin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update payment status
// @route PUT /api/bookings/:id/pay
// @access Private
exports.updatePaymentStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('room');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const selectedRoom = booking.room;
        
        // Mark as paid
        booking.paymentStatus = 'Paid';
        booking.status = 'Pending';
        await booking.save();

        // ⚡ Respond immediately — do NOT wait for notifications/emails
        res.status(200).json({ message: 'Payment updated successfully', booking });

        // Run notifications in background (fire-and-forget)
        try {
            const io = req.app.get('socketio');
            const hotel = await Hotel.findById(booking.hotel);
            
            // 1. Emit real-time inventory update
            if (io && booking.room) {
               const roomObj = booking.room;
               io.to(hotel?.manager?.toString()).emit('roomBooked', { 
                   roomId: roomObj._id, 
                   availability: roomObj.totalRooms - roomObj.occupiedRooms 
               });
            }

            // 2. Notify Customer
            if (req.user && req.user.email) {
                sendNotification(io, {
                    userId: req.user._id,
                    userEmail: req.user.email,
                    title: 'Payment Successful! ✅',
                    message: `Your payment for ${hotel ? hotel.name : 'your booking'} has been successfully received. Your stay is now pending manager approval.`,
                    type: 'payment',
                    link: '/my-bookings',
                    btnText: 'DOWNLOAD INVOICE',
                    payload: {
                        'Hotel': hotel ? hotel.name : 'Royal Hotel',
                        'Status': 'Payment Confirmed',
                        'Amount': `₹${booking.totalPrice}`,
                        'Transaction ID': booking._id.toString().toUpperCase().slice(-8)
                    }
                }).catch(e => console.error('Payment notif error:', e.message));
            }

            // 3. Notify Manager
            if (hotel && hotel.manager) {
                sendNotification(io, {
                    userId: hotel.manager,
                    userEmail: '', 
                    title: 'New Booking Request 🔔',
                    message: `A customer has paid for a new booking at ${hotel.name}. Please review and accept or reject it.`,
                    type: 'booking',
                    link: '/manager/dashboard'
                }).catch(e => console.error('Manager notif error:', e.message));
            }
        } catch (notifError) {
            console.error('Background notification error after payment:', notifError);
        }

        return;
    } catch (error) {
        console.error('Critical Payment Update Error:', error);
        return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

// @desc Get user bookings
// @route GET /api/bookings/mybookings
// @access Private
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate('hotel room');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all bookings (Manager/Admin)
// @route GET /api/bookings
// @access Private (Manager/Admin)
exports.getAllBookings = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'manager') {
            const hotels = await Hotel.find({ manager: req.user._id });
            const hotelIds = hotels.map(h => h._id);
            query.hotel = { $in: hotelIds };
        }
        const bookings = await Booking.find(query).populate('user hotel room');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Cancel booking
// @route DELETE /api/bookings/:id
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('hotel');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Allow: the booking's customer, the hotel's manager, or an admin
        const isBookingOwner = booking.user.toString() === req.user._id.toString();
        const isHotelManager = booking.hotel && booking.hotel.manager && booking.hotel.manager.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isBookingOwner && !isHotelManager && !isAdmin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const room = await Room.findById(booking.room);
        if (room) {
            room.occupiedRooms = Math.max(0, room.occupiedRooms - 1);
            await room.save();
        }

        booking.status = 'Cancelled';
        await booking.save();

        // Send Notification to the customer
        const io = req.app.get('socketio');
        await sendNotification(io, {
            userId: booking.user,
            userEmail: req.user.email,
            title: 'Booking Cancelled ❌',
            message: `Your booking for ${room ? room.roomType : 'room'} has been successfully cancelled.`,
            type: 'cancellation',
            link: '/profile'
        });

        // If cancelled by customer, notify ONLY the specific hotel manager
        if (isBookingOwner && booking.hotel && booking.hotel.manager) {
            await sendNotification(io, {
                userId: booking.hotel.manager,
                userEmail: '',
                title: 'Booking Cancelled by Customer ❌',
                message: `A customer has cancelled their booking at ${booking.hotel.name}.`,
                type: 'cancellation',
                link: '/manager/dashboard'
            });
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc Update booking status
// @route PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const booking = await Booking.findById(req.params.id).populate('hotel');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const previousStatus = booking.status;
        booking.status = status;
        await booking.save();

        // Update inventory if status changed to/from Cancelled
        if (status === 'Cancelled' && (previousStatus === 'Confirmed' || previousStatus === 'Completed')) {
           const room = await Room.findById(booking.room);
           if (room) {
               room.occupiedRooms = Math.max(0, room.occupiedRooms - 1);
               await room.save();
           }
        } else if (status === 'Confirmed' && previousStatus !== 'Confirmed') {
           const room = await Room.findById(booking.room);
           if (room) {
               room.occupiedRooms += 1;
               await room.save();
           }
        }

        // ⚡ Respond immediately — do NOT wait for notifications/emails
        res.json(booking);

        // Run notification in background (fire-and-forget)
        const io = req.app.get('socketio');
        User.findById(booking.user).then(customer => {
            sendNotification(io, {
                userId: booking.user,
                userEmail: customer ? customer.email : '',
                title: status === 'Confirmed' ? 'Booking Confirmed! 🎊' : `Booking Update: ${status}`,
                message: status === 'Confirmed' 
                    ? `Great news! Your stay at ${booking.hotel.name} has been officially confirmed by the manager. We look forward to welcoming you!`
                    : `Your booking at ${booking.hotel.name} is now ${status}.`,
                type: status === 'Cancelled' ? 'cancellation' : 'booking',
                link: '/dashboard',
                payload: status === 'Confirmed' ? {
                    'Hotel': booking.hotel.name,
                    'Check-in': new Date(booking.checkIn).toLocaleDateString(),
                    'Check-out': new Date(booking.checkOut).toLocaleDateString(),
                    'Total Price': `₹${booking.totalPrice}`,
                    'Status': 'Confirmed'
                } : null
            }).catch(e => console.error('Status notif error:', e.message));
        }).catch(e => console.error('Customer lookup error:', e.message));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Generate PDF Invoice
// @route GET /api/bookings/:id/invoice
// @access Private
exports.generateInvoice = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user')
            .populate('hotel')
            .populate('room');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Ensure user is owner or admin
        if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const doc = new PDFDocument({ margin: 50 });

        // Pipe its output somewhere, like to a response or file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${booking._id}.pdf`);
        doc.pipe(res);

        // Header
        doc.fillColor('#444444').fontSize(20).text('ROYAL HOTEL BOOKINGS', 50, 50, { align: 'center' });
        doc.fontSize(10).text('Premium Hospitality Services', 50, 75, { align: 'center' });
        doc.moveDown();

        // Line
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

        // Invoice Info
        doc.fillColor('#444444').fontSize(14).text('INVOICE', 50, 120);
        doc.fontSize(10).text(`Invoice Number: INV-${booking._id.toString().substring(0, 8).toUpperCase()}`, 50, 140);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 155);
        doc.text(`Payment Status: ${booking.paymentStatus}`, 50, 170);

        // Billing Details
        doc.text('Bill To:', 350, 120, { bold: true });
        doc.text(booking.user.name, 350, 140);
        doc.text(booking.user.email, 350, 155);
        if (booking.user.phone) doc.text(booking.user.phone, 350, 170);

        doc.moveDown(4);

        // Stay Details
        doc.fontSize(12).text('Stay Details', 50, 210, { underline: true });
        doc.fontSize(10);
        doc.text(`Hotel: ${booking.hotel.name}`, 50, 230);
        doc.text(`Location: ${booking.hotel.location}`, 50, 245);
        doc.text(`Room Type: ${booking.room.roomType}`, 50, 260); // Fixed typo from type to roomType
        doc.text(`Check-in: ${new Date(booking.checkIn).toLocaleDateString()}`, 50, 275);
        doc.text(`Check-out: ${new Date(booking.checkOut).toLocaleDateString()}`, 50, 290);
        doc.text(`Guests: ${booking.guests}`, 50, 305);

        // Extras
        if (booking.selectedExtras && booking.selectedExtras.length > 0) {
            doc.text(`Add-ons: ${booking.selectedExtras.map(e => e.name).join(', ')}`, 50, 320);
        }

        // Table Header
        doc.moveDown(2);
        const tableTop = 350;
        doc.fillColor('#f8fafc').rect(50, tableTop, 500, 20).fill();
        doc.fillColor('#444444').text('Description', 60, tableTop + 5);
        doc.text('Price/Night', 250, tableTop + 5);
        doc.text('Nights', 350, tableTop + 5);
        doc.text('Total', 450, tableTop + 5);

        // Table Rows
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
        const pricePerNight = booking.totalPrice / nights;

        doc.text(`${booking.room.roomType} - ${booking.hotel.name}`, 60, tableTop + 30); // Fixed roomType
        doc.text(`INR ${pricePerNight.toFixed(2)}`, 250, tableTop + 30);
        doc.text(nights.toString(), 350, tableTop + 30);
        doc.text(`INR ${booking.totalPrice.toFixed(2)}`, 450, tableTop + 30);

        // Total
        doc.moveDown(4);
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(350, doc.y).lineTo(550, doc.y).stroke();
        doc.fontSize(12).text('Grand Total:', 350, doc.y + 10);
        doc.fillColor('#1a5f7a').text(`INR ${booking.totalPrice.toFixed(2)}`, 450, doc.y - 12, { bold: true });

        // Footer
        const footerY = 700;
        doc.fillColor('#aaaaaa').fontSize(8).text('Thank you for choosing Royal Hotel Bookings.', 50, footerY, { align: 'center' });
        doc.text('This is a computer generated invoice and does not require a signature.', 50, footerY + 15, { align: 'center' });

        doc.end();

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
        console.error('Invoice Gen Error:', error);
    }
};

// @desc Verify QR Code and check-in guest
// @route PUT /api/bookings/verify-qr/:qrCode
exports.verifyQRCode = async (req, res) => {
    try {
        const { qrCode } = req.params;
        const booking = await Booking.findOne({ qrCode }).populate('user hotel room');

        if (!booking) {
            return res.status(404).json({ message: 'Invalid QR Code' });
        }

        // Ensure the manager owns the hotel
        if (booking.hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to verify this booking' });
        }

        if (booking.status === 'Checked-in') {
            return res.status(400).json({ message: 'Guest is already checked-in' });
        }

        if (booking.status !== 'Confirmed') {
            return res.status(400).json({ message: `Booking status is ${booking.status}. Only confirmed bookings can be checked-in.` });
        }

        booking.status = 'Checked-in';
        await booking.save();

        res.json({
            message: 'Check-in Successful! ✅',
            booking: {
                id: booking._id,
                guestName: booking.user.name,
                roomType: booking.room.roomType,
                hotelName: booking.hotel.name
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get analytics data for manager
// @route GET /api/bookings/analytics
// @access Private (Manager)
exports.getAnalytics = async (req, res) => {
    try {
        const hotels = await Hotel.find({ manager: req.user._id });
        const hotelIds = hotels.map(h => h._id);

        const bookings = await Booking.find({ hotel: { $in: hotelIds } });

        // Revenue by month (last 6 months)
        const revenueTrends = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            let rev = 0;
            
            bookings.forEach(b => {
                const bDate = new Date(b.createdAt);
                if (bDate.getMonth() === date.getMonth() && bDate.getFullYear() === date.getFullYear() && b.status !== 'Cancelled') {
                    rev += b.totalPrice;
                }
            });
            revenueTrends.push({ name: monthNames[date.getMonth()], rev });
        }

        // Occupancy rate per hotel (Visual appeal approximation for this example)
        const occupancyRates = [];
        for (const hotel of hotels) {
            const occ = Math.floor(Math.random() * 40 + 50); // Visual mock for occupancy
            occupancyRates.push({ name: hotel.name, occ });
        }

        res.json({
            revenueTrends,
            occupancyRates
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
