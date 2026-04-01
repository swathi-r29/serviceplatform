const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedWorkers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const dummyWorkers = [
            {
                name: "John Carpenter",
                email: "john.carpenter@example.com",
                password: hashedPassword,
                role: "worker",
                phone: "9876543210",
                skills: ["Carpentry", "Furniture Repair"],
                location: "Downtown",
                rating: 4.8,
                reviewCount: 45,
                isAvailable: true,
                profileImage: "" // Default icon will be used
            },
            {
                name: "Alice Wood",
                email: "alice.wood@example.com",
                password: hashedPassword,
                role: "worker",
                phone: "9876543211",
                skills: ["Carpentry", "Polishing"],
                location: "Uptown",
                rating: 4.9,
                reviewCount: 32,
                isAvailable: true,
                profileImage: ""
            },
            {
                name: "Bob Builder",
                email: "bob.builder@example.com",
                password: hashedPassword,
                role: "worker",
                phone: "9876543212",
                skills: ["Construction", "Carpentry"],
                location: "Suburbs",
                rating: 4.5,
                reviewCount: 15,
                isAvailable: true,
                profileImage: ""
            }
        ];

        for (const worker of dummyWorkers) {
            const exists = await User.findOne({ email: worker.email });
            if (!exists) {
                await User.create(worker);
                console.log(`Created worker: ${worker.name}`);
            } else {
                console.log(`Worker ${worker.name} already exists.`);
                // Ensure they have the skill just in case
                if (!exists.skills.includes('Carpentry')) {
                    exists.skills.push('Carpentry');
                    await exists.save();
                    console.log(`Added Carpentry skill to ${worker.name}`);
                }
            }
        }

        console.log('Seeding completed.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedWorkers();
