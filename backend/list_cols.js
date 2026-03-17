const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const listCollections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(c => console.log(`- ${c.name}`));
    
    // Also check for any other databases if possible (though limited by URI)
    console.log('Database name:', mongoose.connection.db.databaseName);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

listCollections();
