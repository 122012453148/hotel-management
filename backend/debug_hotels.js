const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const User = require('./models/User');

const checkHotels = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/hotel_management'); 
        console.log('Connected to MongoDB');

        const hotels = await Hotel.find().populate('manager');
        console.log('--- Hotels in Database ---');
        hotels.forEach(h => {
            console.log(`Name: ${h.name}`);
            console.log(`Manager: ${h.manager?.name} (${h.manager?.role})`);
            console.log(`Is Approved: ${h.isApproved}`);
            console.log(`Created At: ${h.createdAt}`);
            console.log('--------------------------');
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

checkHotels();
