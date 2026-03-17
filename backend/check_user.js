const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'jessi@gmail.com' });
        if (user) {
            console.log('User found:', {
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isBlocked: user.isBlocked,
                hasPassword: !!user.password
            });
        } else {
            console.log('User jessi@gmail.com NOT found');
            const allUsers = await User.find({}, 'email role');
            console.log('All users in DB:', allUsers);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
checkUser();
