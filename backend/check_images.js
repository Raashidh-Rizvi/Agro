const mongoose = require('mongoose');
const ExpertQuery = require('./src/models/ExpertQuery');
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const counts = await ExpertQuery.countDocuments({ imageUrl: { $exists: true, $ne: '' } });
        console.log('Queries with imageUrl:', counts);
        const samples = await ExpertQuery.find({ imageUrl: { $exists: true, $ne: '' } }).sort({ createdAt: -1 }).limit(3);
        console.log('Sample queries with images:');
        console.log(JSON.stringify(samples, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
