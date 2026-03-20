const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');
const Hotel = require('./models/Hotel');

dotenv.config();

const checkRooms = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const rooms = await Room.find({}).populate('hotel', 'name');
    console.log('Total Rooms Found:', rooms.length);
    rooms.forEach(r => {
      console.log(`- Room Type: ${r.roomType} | Hotel: ${r.hotel?.name || 'Lost Hotel'}`);
    });
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkRooms();
