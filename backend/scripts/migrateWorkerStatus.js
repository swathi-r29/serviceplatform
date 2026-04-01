const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const migrateWorkerStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all users who don't have a status field but have isApproved (or were created before this update)
        const workers = await User.find({ role: 'worker', status: { $exists: false } });
        console.log(`Found ${workers.length} workers to migrate.`);

        for (const worker of workers) {
            // If we had a previous 'isApproved' field in our DB (before schema change)
            // Note: Mongoose might already show 'pending' as default for new queries
            // but we want to be explicit for old data.

            const prevIsApproved = worker._doc.isApproved; // Access raw doc if field removed from schema
            worker.status = prevIsApproved ? 'approved' : 'pending';

            await worker.save();
            console.log(`Migrated worker ${worker.email}: status=${worker.status}`);
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateWorkerStatus();
