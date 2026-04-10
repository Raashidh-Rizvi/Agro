const mongoose = require('mongoose');
const ExpertQuery = require('./src/models/ExpertQuery');
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const latest = await ExpertQuery.findOne().sort({ createdAt: -1 });
        console.log('LATEST QUERY IN DB:');
        console.log(JSON.stringify(latest, null, 2));
        
        if (latest && latest.userId) {
            const User = require('./src/models/User');
            const author = await User.findById(latest.userId);
            console.log('AUTHOR IN DB:');
            console.log(JSON.stringify(author, null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
