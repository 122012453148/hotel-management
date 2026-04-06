const PDFDocument = require('pdfkit');
const Booking = require('../models/Booking');

/**
 * Generates a PDF buffer for a booking invoice
 * @param {string} bookingId - The ID of the booking
 * @returns {Promise<Buffer>} - The PDF buffer
 */
const generateInvoiceBuffer = async (bookingId) => {
    try {
        const booking = await Booking.findById(bookingId)
            .populate('user')
            .populate('hotel')
            .populate('room');

        if (!booking) throw new Error('Booking not found');

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', (err) => {
                reject(err);
            });

            // --- PDF CONTENT (Copied and adapted from bookingController.js) ---
            
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
            doc.text(`Room Type: ${booking.room.roomType}`, 50, 260);
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

            doc.text(`${booking.room.roomType} - ${booking.hotel.name}`, 60, tableTop + 30);
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
            // --- END PDF CONTENT ---
        });
    } catch (error) {
        console.error('PDF Gen Error:', error);
        throw error;
    }
};

module.exports = { generateInvoiceBuffer };
