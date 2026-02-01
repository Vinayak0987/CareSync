const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// Helper to generate order ID
const generateOrderId = async () => {
    const year = new Date().getFullYear();
    const count = await Order.countDocuments();
    return `ORD-${year}-${String(count + 1).padStart(3, '0')}`;
};

// @desc    Get all orders (for pharmacy)
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find().sort({ orderDate: -1 });
    const formattedOrders = orders.map(order => order.toFrontendFormat());
    res.json(formattedOrders);
});

// @desc    Get orders by patient name
// @route   GET /api/orders/patient/:patientName
// @access  Private
const getPatientOrders = asyncHandler(async (req, res) => {
    const { patientName } = req.params;
    const orders = await Order.find({ patientName }).sort({ orderDate: -1 });
    const formattedOrders = orders.map(order => order.toFrontendFormat());
    res.json(formattedOrders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    res.json(order.toFrontendFormat());
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const {
        patientName,
        patientAvatar,
        items,
        total,
        prescription,
        prescriptionVerified,
        deliveryAddress
    } = req.body;

    if (!patientName || !items || items.length === 0 || !deliveryAddress) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const orderId = await generateOrderId();

    const order = await Order.create({
        orderId,
        patientName,
        patientAvatar: patientAvatar || '',
        items,
        total,
        status: 'pending',
        prescription: prescription || false,
        prescriptionVerified: prescriptionVerified || false,
        deliveryAddress
    });

    res.status(201).json(order.toFrontendFormat());
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'dispatched', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    order.status = status;
    await order.save();

    res.json(order.toFrontendFormat());
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    await order.deleteOne();
    res.json({ message: 'Order removed' });
});

module.exports = {
    getOrders,
    getPatientOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder
};
