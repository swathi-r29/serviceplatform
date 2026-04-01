const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');

dotenv.config();

const checkService = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Search for service with name similar to "Blocked drain cleaning"
        const service = await Service.findOne({ name: /Blocked drain cleaning/i });

        if (service) {
            console.log('Service Found:');
            console.log('Name:', service.name);
            console.log('Category:', service.category);
            console.log('Category Type:', typeof service.category);
        } else {
            console.log('Service "Blocked drain cleaning" not found.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkService();
