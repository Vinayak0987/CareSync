const express = require('express');
const router = express.Router();
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const {
  getOrders,
  getPatientOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');

// @desc    Get all orders (for pharmacy dashboard)
// @route   GET /api/orders
// @access  Private (optional for demo)
router.get('/', optionalProtect, getOrders);

// @desc    Get orders by patient name
// @route   GET /api/orders/patient/:patientName
// @access  Private (optional for demo)
router.get('/patient/:patientName', optionalProtect, getPatientOrders);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (optional for demo)
router.post('/', optionalProtect, createOrder);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (optional for demo)
router.get('/:id', optionalProtect, getOrderById);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (optional for demo)
router.put('/:id/status', optionalProtect, updateOrderStatus);

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (optional for demo)
router.delete('/:id', optionalProtect, deleteOrder);

module.exports = router;
