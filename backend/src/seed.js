const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('./models/User');
const Crop = require('./models/Crop');
const ProduceListing = require('./models/ProduceListing');
const AdvisoryAlert = require('./models/AdvisoryAlert');
const Diagnosis = require('./models/Diagnosis');
const ExpertQuery = require('./models/ExpertQuery');

dotenv.config();



const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected! Clearing existing data...');

        // Clear all collections
        await User.deleteMany({});
        await Crop.deleteMany({});
        await ProduceListing.deleteMany({});
        await AdvisoryAlert.deleteMany({});
        await Diagnosis.deleteMany({});
        await ExpertQuery.deleteMany({});

        console.log('Creating sample users...');
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = 'password';
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        console.log('Default seeded password:', defaultPassword);

        const users = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@agro.com',
                password: hashedPassword,
                role: 'Admin'
            },
            {
                name: 'Dr. Aruna Perera',
                email: 'expert@agro.com',
                password: hashedPassword,
                role: 'Expert'
            },
            {
                name: 'Kamal Silva',
                email: 'farmer@agro.com',
                password: hashedPassword,
                role: 'Farmer',
                farmName: 'Silva Green Farm',
                location: 'Polonnaruwa',
                farmSize: 5.5,
                farmType: 'Rice'
            }
        ]);

        const admin = users[0];
        const expert = users[1];
        const farmer = users[2];

        console.log('Seeding Crops...');
        const crops = await Crop.insertMany([
            {
                userId: farmer._id,
                cropName: 'Samba Rice',
                cropType: 'Cereal',
                plantedDate: new Date('2024-03-15'),
                cropDuration: 120,
                landSize: 3.5,
                district: 'Polonnaruwa',
                description: 'High-quality Samba rice plantation in early growth stage.'
            },
            {
                userId: farmer._id,
                cropName: 'Ceylon Tea',
                cropType: 'Plantation',
                plantedDate: new Date('2023-11-10'),
                cropDuration: 365,
                landSize: 2.0,
                district: 'Matale',
                description: 'Organic tea plantation focused on export quality.'
            }
        ]);

        console.log('Seeding Marketplace (ProduceListings)...');
        await ProduceListing.insertMany([
            {
                userId: farmer._id,
                name: 'Organic Paddy Seeds',
                description: 'Premium quality organic Samba paddy seeds, highly resistant to pests.',
                price: 1500,
                category: 'Seeds',
                sellerName: 'Silva Green Farm',
                rating: 4.8,
                badge: 'Best Seller',
                imageUrl: 'https://images.unsplash.com/photo-1536633100185-28823b154a1a?auto=format&fit=crop&w=400&q=80'
            },
            {
                userId: farmer._id,
                name: 'Liquid Bio-Fertilizer',
                description: 'Eco-friendly fertilizer for faster crop growth and higher yield.',
                price: 2500,
                category: 'Fertilizers',
                sellerName: 'Silva Green Farm',
                rating: 4.5,
                imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=400&q=80'
            },
            {
                userId: farmer._id,
                name: 'Professional Hoe Tool',
                description: 'Durable steel hoe with ergonomic handle for easy soil preparation.',
                price: 3200,
                category: 'Tools',
                sellerName: 'Silva Green Farm',
                rating: 4.2,
                imageUrl: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=400&q=80'
            }
        ]);

        console.log('Seeding Advisory Alerts...');
        await AdvisoryAlert.insertMany([
            {
                title: 'Heavy Rain Warning',
                cropType: 'All',
                district: 'Polonnaruwa',
                season: 'Yala',
                message: 'Heavy rainfall expected over the weekend. Please ensure proper drainage in paddy fields.',
                alertType: 'weather',
                createdBy: expert._id
            },
            {
                title: 'Paddy Blast Alert',
                cropType: 'Rice',
                district: 'Gampaha',
                season: 'Maha',
                message: 'Outbreak of Paddy Blast reported in neighboring farms. Monitor leaves for brown spots.',
                alertType: 'pest',
                createdBy: expert._id
            }
        ]);

        console.log('Seeding Diagnoses...');
        await Diagnosis.insertMany([
            {
                userId: farmer._id,
                imageUrl: 'https://example.com/disease_leaf.jpg',
                diseaseName: 'Bacterial Blight',
                confidenceScore: 94.5,
                cause: 'Xanthomonas oryzae bacteria',
                recommendation: 'Drain the field and apply recommended copper-based bactericides.',
                symptoms: ['Water-soaked streaks', 'Yellowing of leaves', 'Wilting'],
                treatment: ['Copper Oxychloride', 'Streptocycline'],
                prevention: ['Use resistant varieties', 'Balanced nitrogen application'],
                isMock: true
            }
        ]);

        console.log('Seeding Expert Queries...');
        await ExpertQuery.insertMany([
            {
                userId: farmer._id,
                cropId: crops[0]._id.toString(),
                title: 'Yellowing of Paddy Leaves',
                description: 'The leaves of my Samba rice are starting to turn yellow at the tips. Is this a nutrient deficiency?',
                status: 'Replied',
                reply: 'Based on your description, this looks like Nitrogen deficiency. Apply Urea (50kg/ha) as a top dressing.',
                imageUrl: 'https://example.com/query_image.jpg'
            },
            {
                userId: farmer._id,
                cropId: crops[1]._id.toString(),
                title: 'Tea Mite Control',
                description: 'Seeing some red mites on the underside of tea leaves. What organic control methods do you recommend?',
                status: 'Pending'
            }
        ]);

        console.log('Successfully seeded all data!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();

