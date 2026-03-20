const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Hotel = require('./models/Hotel');

dotenv.config();

const checkHotels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const hotels = await Hotel.find({}).populate('manager', 'name email');
    console.log('Total Hotels Found:', hotels.length);
    hotels.forEach(h => {
      console.log(`- ${h.name} | Approved: ${h.isApproved} | Suspended: ${h.isSuspended} | Manager: ${h.manager?.name}`);
    });
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkHotels();
