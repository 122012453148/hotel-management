const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hotel = require('./models/Hotel');

dotenv.config();

const checkBaseQuery = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const query = { isApproved: true, isSuspended: false };
    const hotels = await Hotel.find(query);
    console.log('Query:', JSON.stringify(query));
    console.log('Hotels Found:', hotels.length);
    hotels.forEach(h => console.log(`- ${h.name}`));
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkBaseQuery();
