const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testQuery = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const category1 = "Plumbing";
        const category2 = "plumbing";

        console.log(`Testing query for category: "${category1}"`);
        const workers1 = await User.find({
            role: 'worker',
            skills: { $regex: new RegExp(`^${category1}$`, 'i') }
        });
        console.log(`Found ${workers1.length} workers for "${category1}"`);
        workers1.forEach(w => console.log(`- ${w.name} (Skills: ${w.skills.join(', ')})`));

        console.log(`\nTesting query for category: "${category2}"`);
        const workers2 = await User.find({
            role: 'worker',
            skills: { $regex: new RegExp(`^${category2}$`, 'i') }
        });
        console.log(`Found ${workers2.length} workers for "${category2}"`);
        workers2.forEach(w => console.log(`- ${w.name} (Skills: ${w.skills.join(', ')})`));

        // Also check raw skills in DB
        const allWorkers = await User.find({ role: 'worker' });
        console.log(`\nTotal workers in DB: ${allWorkers.length}`);
        allWorkers.forEach(w => console.log(`- ${w.name}: [${w.skills.join(', ')}]`));

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testQuery();
