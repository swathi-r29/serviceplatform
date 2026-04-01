const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Service = require('./models/Service');

console.log('Script started');

const updateServices = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const categories = {
            'Carpentry': {
                features: [
                    'Professional tools and equipment',
                    'Damage-free furniture handling',
                    'Post-service cleanup',
                    '30-day warranty on workmanship'
                ],
                variants: [
                    { name: 'Minor Repair', label: 'SMALL', price: 499, duration: 1 },
                    { name: 'Standard Assembly', label: 'MEDIUM', price: 999, duration: 3 },
                    { name: 'Custom Work', label: 'LARGE', price: 2999, duration: 8 }
                ],
                addons: [
                    { name: 'Old Furniture Removal', price: 299, description: 'Disposal of old items' },
                    { name: 'Wood Polishing', price: 499, description: 'Premium polish finish' },
                    { name: 'Material Procurement', price: 149, description: 'We buy materials for you' }
                ]
            },
            'Cleaning': {
                features: [
                    'Eco-friendly chemicals',
                    'Deep stain removal',
                    'Sanitization of high-touch areas',
                    'Background verified professionals'
                ],
                variants: [
                    { name: '1 BHK', label: 'SMALL', price: 1499, duration: 4 },
                    { name: '2 BHK', label: 'MEDIUM', price: 1999, duration: 6 },
                    { name: '3 BHK', label: 'LARGE', price: 2499, duration: 8 },
                    { name: 'Villa/Independant', label: 'EXTRA', price: 4999, duration: 10 }
                ],
                addons: [
                    { name: 'Fridge Interior', price: 199, description: 'Deep clean inside fridge' },
                    { name: 'Oven Cleaning', price: 249, description: 'Grease removal' },
                    { name: 'Balcony Wash', price: 149, description: 'Pressure wash balcony' }
                ]
            },
            'Plumbing': {
                features: [
                    'Leak detection expert',
                    'branded spare parts usage',
                    'No hidden costs',
                    'Post-work cleanup'
                ],
                variants: [
                    { name: 'Basic Inspection', label: 'VISIT', price: 199, duration: 1 },
                    { name: 'Installation', label: 'STANDARD', price: 599, duration: 2 },
                    { name: 'Major Repair', label: 'COMPLEX', price: 1499, duration: 5 }
                ],
                addons: [
                    { name: 'Drain Cleaning', price: 399, description: 'Chemical unclogging' },
                    { name: 'Spare Part Procurement', price: 99, description: 'Transporation cost' }
                ]
            },
            'Electrical': {
                features: [
                    'Certified electricians',
                    'Safety gear usage',
                    'Shock-proof auditing',
                    'Warranty on wiring'
                ],
                variants: [
                    { name: 'Visit & Inspection', label: 'VISIT', price: 149, duration: 1 },
                    { name: 'Switch/Socket Fix', label: 'MINOR', price: 299, duration: 1 },
                    { name: 'Wiring Work', label: 'MAJOR', price: 999, duration: 4 }
                ],
                addons: [
                    { name: 'AC Switch Install', price: 249, description: 'Heavy duty switch' },
                    { name: 'Inverter Connect', price: 499, description: 'Battery connection' }
                ]
            },
            'Painting': {
                features: [
                    'Laser measurement',
                    'Furniture masking',
                    'Post-paint cleanup',
                    'On-time completion'
                ],
                variants: [
                    { name: 'Single Wall', label: 'ACCENT', price: 1999, duration: 8 },
                    { name: '1 Room', label: 'REFRESH', price: 5999, duration: 16 },
                    { name: 'Full Home', label: 'MAKEOVER', price: 24999, duration: 72 }
                ],
                addons: [
                    { name: 'Waterproofing', price: 2999, description: 'Damp proof treatment' },
                    { name: 'Wall Art', price: 1499, description: 'Stencil design' }
                ]
            },
            'AC Repair': {
                features: [
                    'Gas pressure check',
                    'Filter cleaning',
                    'Cooling performance test',
                    '30-day service warranty'
                ],
                variants: [
                    { name: 'General Service', label: 'CLEAN', price: 499, duration: 1 },
                    { name: 'Gas Refill', label: 'COOLING', price: 1499, duration: 1 },
                    { name: 'Install/Uninstall', label: 'SHIFTING', price: 999, duration: 2 }
                ],
                addons: [
                    { name: 'Copper Pipe (per ft)', price: 250, description: 'Extra piping' },
                    { name: 'Stand Installation', price: 499, description: 'Outdoor unit stand' }
                ]
            },
            'Cooking': {
                features: [
                    'Hygiene cap & gloves',
                    'Healthy oil usage',
                    'Kitchen cleanup',
                    'Customized spice levels'
                ],
                variants: [
                    { name: '1 Meal (2 people)', label: 'COUPLE', price: 299, duration: 2 },
                    { name: '1 Meal (4 people)', label: 'FAMILY', price: 499, duration: 3 },
                    { name: 'Party (10+ people)', label: 'EVENT', price: 1999, duration: 6 }
                ],
                addons: [
                    { name: 'Grocery Shopping', price: 149, description: 'We buy fresh veggies' },
                    { name: 'Dishwashing', price: 99, description: 'Utensil cleaning' }
                ]
            }
        };

        for (const [category, data] of Object.entries(categories)) {
            console.log(`Updating services for category: ${category}`);
            const result = await Service.updateMany(
                { category: category },
                {
                    $set: {
                        features: data.features,
                        variants: data.variants,
                        addons: data.addons
                    }
                }
            );
            console.log(`Matched ${result.matchedCount}, Modified ${result.modifiedCount}`);
        }

        // Handle 'Other' or uncategorized by giving them generic data
        const genericData = {
            features: ['Professional Service', 'Verified Tools', 'Cleanup included'],
            variants: [
                { name: 'Standard', label: 'STD', price: 499, duration: 2 },
                { name: 'Premium', label: 'PRO', price: 999, duration: 4 }
            ],
            addons: [
                { name: 'Express Service', price: 199, description: 'Priority arrival' }
            ]
        };

        console.log('Updating generic services...');
        const resultGeneric = await Service.updateMany(
            { category: { $nin: Object.keys(categories) } },
            { $set: genericData }
        );
        console.log(`Generic Matched ${resultGeneric.matchedCount}, Modified ${resultGeneric.modifiedCount}`);

        console.log('Update complete');
        process.exit(0);
    } catch (error) {
        console.error('Error updating services:', error);
        process.exit(1);
    }
};

updateServices();
