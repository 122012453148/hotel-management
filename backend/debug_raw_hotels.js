const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkRaw = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const hotels = await db.collection('hotels').find({}).toArray();
    console.log('Total Hotels Found:', hotels.length);
    hotels.forEach(h => {
      console.log(`- Name: ${h.name} | Approved: ${typeof h.isApproved} ${h.isApproved} | Suspended: ${typeof h.isSuspended} ${h.isSuspended}`);
    });
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkRaw();
