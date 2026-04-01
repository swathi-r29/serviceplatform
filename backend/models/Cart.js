const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [{
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        scheduledDate: {
            type: Date,
            required: true
        },
        scheduledTime: {
            type: String,
            required: true
        },
        priceAtAddition: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
