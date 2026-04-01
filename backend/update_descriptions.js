const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Service = require('./models/Service');

const updateDescriptions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const descriptions = {
            'Carpentry': "From fixing creaky doors to building custom cabinets, our expert carpenters handles all your woodworks with precision. We use high-quality materials and modern tools to ensure durable and aesthetic results for your home furniture and fixtures.",
            'Cleaning': "Experience a spotless home with our deep cleaning services. Our verified professionals use eco-friendly products to sanitize every corner, remove stubborn stains, and leave your living space sparkling clean and hygienic.",
            'Plumbing': "Facing a leaky tap or clogged drain? Our skilled plumbers utilize advanced leak detection and repair techniques. We handle everything from minor repairs to major installations, ensuring your water systems run smoothly.",
            'Electrical': "Safety first! Our certified electricians are equipped to handle all electrical needs, from wiring upgrades to switch replacements. We ensure shock-proof, fire-safe, and energy-efficient electrical solutions for your home.",
            'Painting': "Transform your walls with our premium painting services. We offer laser-measured precision, extensive furniture protection, and a wide range of colors/textures. Get a fresh, vibrant look for your home with on-time completion.",
            'AC Repair': "Beat the heat with our comprehensive AC services. Whether it's cooling issues, gas refilling, or routine maintenance, our technicians ensure your air conditioner performs at peak efficiency for a comfortable environment.",
            'Cooking': "Enjoy delicious, home-style meals prepared by our hygienic cooks. Customizable to your taste and dietary needs, our cooks handle everything from vegetable chopping to kitchen cleanup, giving you a hassle-free dining experience."
        };

        for (const [category, desc] of Object.entries(descriptions)) {
            await Service.updateMany(
                { category: category },
                { $set: { description: desc } }
            );
            console.log(`Updated description for ${category}`);
        }
        console.log('Descriptions updated');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updateDescriptions();
