const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkWorkers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const workers = await User.find({ role: 'worker' });
        console.log(`Found ${workers.length} workers.`);

        if (workers.length > 0) {
            console.log('Sample worker:', JSON.stringify(workers[0], null, 2));
        }

        const allSkills = new Set();
        workers.forEach(w => {
            if (w.skills && Array.isArray(w.skills)) {
                w.skills.forEach(s => allSkills.add(s));
            }
        });
        console.log('All skills in database:', Array.from(allSkills));

        workers.forEach(w => {
            console.log(`Worker: ${w.name}, Skills: ${JSON.stringify(w.skills)}`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkWorkers();
