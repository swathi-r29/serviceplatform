const Cart = require('../models/Cart');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

const DISCOUNT_THRESHOLD = 2000;
const DISCOUNT_PERCENTAGE = 0.1; // 10%

// Get User Cart
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.service items.worker');

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        // Recalculate totals
        let subtotal = 0;
        cart.items.forEach(item => {
            subtotal += item.priceAtAddition;
        });

        // 1. Calculate Volume Discount (Tiered)
        let volumeDiscount = 0;
        if (subtotal > 5000) {
            volumeDiscount = subtotal * 0.20; // 20% off for > 5000
        } else if (subtotal > 2000) {
            volumeDiscount = subtotal * 0.10; // 10% off for > 2000
        }

        // 2. Calculate First-Time User Discount
        let firstTimeDiscount = 0;
        const previousBookings = await Booking.countDocuments({ user: req.user._id });
        if (previousBookings === 0 && subtotal > 0) {
            firstTimeDiscount = 200; // Flat ₹200 off for first booking
        }

        cart.totalAmount = subtotal;
        cart.discount = volumeDiscount + firstTimeDiscount;
        cart.finalAmount = Math.max(0, subtotal - cart.discount);

        // Pass detailed discount info to frontend if needed via a separate field or just the total
        // For now, let's keep the model simple but the logic robust

        await cart.save();

        // Return extra info for the UI
        const responseData = {
            ...cart.toObject(),
            discountDetails: {
                volume: volumeDiscount,
                firstTime: firstTimeDiscount
            }
        };

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add to Cart
exports.addToCart = async (req, res) => {
    try {
        const { serviceId, workerId, scheduledDate, scheduledTime } = req.body;

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        cart.items.push({
            service: serviceId,
            worker: workerId,
            scheduledDate,
            scheduledTime,
            priceAtAddition: service.price
        });

        await cart.save();
        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Checkout
exports.checkout = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.service');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const bookings = [];
        const discountPerItem = cart.discount / cart.items.length;

        for (const item of cart.items) {
            const booking = await Booking.create({
                user: req.user._id,
                service: item.service._id,
                worker: item.worker,
                scheduledDate: item.scheduledDate,
                scheduledTime: item.scheduledTime,
                address: req.body.address, // Address provided during checkout
                totalAmount: item.priceAtAddition - discountPerItem,
                notes: req.body.notes || '',
                paymentMethod: req.body.paymentMethod || 'cash'
            });
            bookings.push(booking);
        }

        // Clear cart after checkout
        cart.items = [];
        cart.totalAmount = 0;
        cart.discount = 0;
        cart.finalAmount = 0;
        await cart.save();

        res.status(201).json({ message: 'Bookings created successfully', bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
