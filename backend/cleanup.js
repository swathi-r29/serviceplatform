require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.deleteOne({ email: 'swathi29rd@gmail.com', isVerified: false });
        console.log('Deleted unverified user:', result.deletedCount);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

cleanup();
