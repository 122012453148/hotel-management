const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const userCount = await User.countDocuments();
    const hotelCount = await Hotel.countDocuments();
    const roomCount = await Room.countDocuments();

    console.log(`Users: ${userCount}`);
    console.log(`Hotels: ${hotelCount}`);
    console.log(`Rooms: ${roomCount}`);

    if (userCount > 0) {
      const users = await User.find().limit(5);
      console.log('Sample Users:');
      users.forEach(u => console.log(`- ${u.email} (${u.role}), Verified: ${u.isVerified}, Blocked: ${u.isBlocked}`));
    }

    if (hotelCount > 0) {
      const hotels = await Hotel.find().limit(5);
      console.log('Sample Hotels:');
      hotels.forEach(h => console.log(`- ${h.name}, Approved: ${h.isApproved}, City: ${h.city}`));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
