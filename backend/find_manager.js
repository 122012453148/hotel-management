const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const findManager = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ role: 'manager' });
    console.log('Managers Found:', users.length);
    users.forEach(u => console.log(`- ${u._id} | ${u.name} | ${u.email}`));
    if (users.length === 0) {
        const any = await User.find({});
        console.log('No managers. Any users:');
        any.forEach(u => console.log(`- ${u._id} | ${u.name} | ${u.role}`));
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

findManager();
