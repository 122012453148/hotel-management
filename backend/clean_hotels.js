const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hotel = require('./models/Hotel');
const User = require('./models/User');

dotenv.config();

const cleanHotels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const hotels = await Hotel.find({});
    for (const h of hotels) {
      const user = await User.findById(h.manager);
      if (!user) {
        console.log(`Deleting hotel with lost manager: ${h.name}`);
        await h.deleteOne();
      }
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

cleanHotels();
