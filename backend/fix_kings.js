const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');

const fixHotels = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/hotel_management'); 
        console.log('Connected to MongoDB');

        const result = await Hotel.updateMany(
            { name: { $in: ['Kings'] } }, 
            { $set: { isApproved: false } }
        );
        console.log('Updated hotels:', result);

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

fixHotels();
