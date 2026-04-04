const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const emailToCheck = '2312041@nec.edu.in';
        const users = await User.find({ email: emailToCheck });

        console.log(`\n🔍 Checking for email: ${emailToCheck}`);
        if (users.length === 0) {
            console.log('❌ No users found with this email.');
        } else {
            console.log(`✅ Found ${users.length} user(s):`);
            users.forEach(u => {
                console.log(`   - Name: ${u.name}, ID: ${u._id}, Role: ${u.role}, Status: ${u.status}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

checkUsers();
