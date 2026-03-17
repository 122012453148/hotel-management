const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');
const User = require('./models/User');

dotenv.config();

const sampleHotels = [
  {
    name: 'The Grand Chennai luxury Resort',
    location: 'Chennai',
    description: 'A luxurious beachfront resort in the heart of Chennai with stunning views of the Bay of Bengal.',
    amenities: ['WiFi', 'Swimming Pool', 'Gym', 'Restaurant', 'Parking'],
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200'],
    rating: 4.8,
    isApproved: true
  },
  {
    name: 'Ooty Misty Heights',
    location: 'Ooty',
    description: 'Experience the chill and beauty of the Blue Mountains in this cozy boutique hotel.',
    amenities: ['WiFi', 'Breakfast', 'Parking'],
    images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=1200'],
    rating: 4.5,
    isApproved: true
  },
  {
    name: 'Tamil Heritage Inn',
    location: 'Madurai',
    description: 'A traditional stay that blends modern luxury with ancient Tamil culture.',
    amenities: ['WiFi', 'Restaurant', 'Breakfast'],
    images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200'],
    rating: 4.2,
    isApproved: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing
    await Hotel.deleteMany({});
    await Room.deleteMany({});

    // Get an admin user to be the manager (optional but helps)
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        admin = await User.findOne({}); // Just grab any user for demo
    }
    
    if (!admin) {
        console.error('Error: Please register at least one user first so we have a manager for the hotels.');
        process.exit(1);
    }

    for (const h of sampleHotels) {
      const hotel = await Hotel.create({ ...h, manager: admin._id });
      
      // Add 2 room types to each hotel
      await Room.create({
        hotel: hotel._id,
        roomType: 'Deluxe',
        price: 150 + Math.floor(Math.random() * 100),
        capacity: 2,
        totalRooms: 10,
        occupiedRooms: 2,
        amenities: hotel.amenities.slice(0, 3)
      });

      await Room.create({
        hotel: hotel._id,
        roomType: 'Suite',
        price: 350 + Math.floor(Math.random() * 200),
        capacity: 4,
        totalRooms: 5,
        occupiedRooms: 0,
        amenities: hotel.amenities
      });
      console.log(`Created ${hotel.name} with rooms.`);
    }

    console.log('Seeding complete! 🚀');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
