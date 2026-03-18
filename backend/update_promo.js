const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Promotion = require('./models/Promotion');

const updatePromo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const promoId = '69ba3e6a0927cd11124adcbb';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const result = await Promotion.updateOne(
      { _id: promoId },
      { $set: { validFrom: yesterday } }
    );
    
    console.log('Update Result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updatePromo();
