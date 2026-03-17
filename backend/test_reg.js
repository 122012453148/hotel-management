const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const testRegistration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const email = 'testuser@example.com';
    const password = 'Password@123';
    
    // Cleanup if exists
    await User.deleteOne({ email });

    const user = await User.create({
      name: 'Test Admin',
      email,
      password,
      role: 'admin',
      isVerified: true
    });

    console.log('User created:', user.email, user._id);

    const match = await user.matchPassword(password);
    console.log('Password match test:', match);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

testRegistration();
