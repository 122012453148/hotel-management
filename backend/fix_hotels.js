const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hotel = require('./models/Hotel');

dotenv.config();

const fixHotels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const manId = '69b92eddc1d0d3fe9f0d3569'; // TestMan
    const result = await Hotel.updateMany({ manager: { $exists: false } }, { manager: manId });
    console.log('Fixed hotels with missing managers:', result.modifiedCount);
    const result2 = await Hotel.updateMany({ manager: null }, { manager: manId });
    console.log('Fixed hotels with null managers:', result2.modifiedCount);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixHotels();
