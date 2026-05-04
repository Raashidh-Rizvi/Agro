const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const User = require('./models/User');

async function seedNewAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'manager@agro.lk';
    const password = 'AgroManager@2026';

    // Remove existing if any
    await User.deleteOne({ email });

    // Create admin user
    const admin = await User.create({
      name: 'Agro Manager',
      email: email,
      password: password,
      role: 'Admin',
    });

    console.log('✅ New Admin user created successfully!');
    console.log('─────────────────────────────');
    console.log('  Email   :', admin.email);
    console.log('  Password:', password);
    console.log('  Role    :', admin.role);
    console.log('─────────────────────────────');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
    process.exit(1);
  }
}

seedNewAdmin();
