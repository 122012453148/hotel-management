const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');
const Hotel = require('./models/Hotel');

dotenv.config();

const checkAvailableRooms = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const rooms = await Room.find({}).populate('hotel', 'name');
    console.log('--- Current Availability ---');
    rooms.forEach(r => {
      console.log(`- Hotel: ${r.hotel?.name || 'Lost'} | Room: ${r.roomType} | Total: ${r.totalRooms} | Occupied: ${r.occupiedRooms}`);
    });
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkAvailableRooms();
