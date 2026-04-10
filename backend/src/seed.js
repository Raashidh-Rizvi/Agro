const mongoose = require('mongoose');
const Crop = require('./models/Crop');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB for seeding');

    const crops = [
      { name: 'Rice', description: 'Main staple crop' },
      { name: 'Tea', description: 'Main export crop' },
      { name: 'Coconut', description: 'Versatile palm crop' },
      { name: 'Rubber', description: 'Plantation crop' },
      { name: 'Banana', description: 'Fruit crop' },
    ];

    await Crop.deleteMany({});
    await Crop.insertMany(crops);
    console.log('Crops seeded:', crops.map(c => c.name));

    process.exit(0);
  })
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });

