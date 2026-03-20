const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hotel = require('./models/Hotel');

dotenv.config();

const updateExisting = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const res = await Hotel.updateMany(
      { isSuspended: { $exists: false } }, 
      { isSuspended: false }
    );
    console.log('Fixed hotels with missing isSuspended:', res.modifiedCount);
    
    // Also check isApproved just in case
    const res2 = await Hotel.updateMany(
      { isApproved: { $exists: false } }, 
      { isApproved: false }
    );
    console.log('Fixed hotels with missing isApproved:', res2.modifiedCount);
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateExisting();
