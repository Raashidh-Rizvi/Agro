const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const User = require('./models/User');

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@agro.lk';
    const adminPassword = 'AdminPassword@123';
    
    const farmerEmail = 'farmer@agro.lk';
    const farmerPassword = 'FarmerPassword@123';

    // Remove existing if any
    await User.deleteOne({ email: adminEmail });
    await User.deleteOne({ email: farmerEmail });

    // Create admin user
    const admin = await User.create({
      name: 'Agro Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'Admin',
    });

    // Create farmer user
    const farmer = await User.create({
      name: 'Agro Farmer',
      email: farmerEmail,
      password: farmerPassword,
      role: 'Farmer',
    });

    console.log('✅ Users created successfully!');
    console.log('─────────────────────────────');
    console.log('  Admin Email   :', admin.email);
    console.log('  Admin Password:', adminPassword);
    console.log('  Role          :', admin.role);
    console.log('─────────────────────────────');
    console.log('  Farmer Email   :', farmer.email);
    console.log('  Farmer Password:', farmerPassword);
    console.log('  Role           :', farmer.role);
    console.log('─────────────────────────────');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
    process.exit(1);
  }
}

seedUsers();
