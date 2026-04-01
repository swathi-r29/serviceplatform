const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./backend/models/User');

const updateWorkers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update Sam (Kovilpatti)
        await User.findOneAndUpdate(
            { name: 'sam' },
            { coordinates: { lat: 9.1762, lng: 77.8773 }, location: 'Kovilpatti' }
        );

        // Update Mansha (vilathikulam)
        await User.findOneAndUpdate(
            { name: 'Mansha' },
            { coordinates: { lat: 9.1306, lng: 78.1670 }, location: 'vilathikulam' }
        );

        console.log('✅ Workers updated with coordinates');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateWorkers();
