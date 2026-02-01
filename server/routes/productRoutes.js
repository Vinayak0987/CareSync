const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middleware/authMiddleware');
const {
    getProducts,
    getStoreProducts,
    getProductById,
    createProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    getCategories
} = require('../controllers/productController');

// Public routes
router.get('/store', getStoreProducts);           // For patient store view
router.get('/categories', getCategories);         // Get all categories

// Protected routes (optional auth for demo)
router.get('/', optionalProtect, getProducts);                    // Get all products (pharmacy)
router.post('/', optionalProtect, createProduct);                 // Create product
router.get('/:id', optionalProtect, getProductById);              // Get single product
router.put('/:id', optionalProtect, updateProduct);               // Update product
router.patch('/:id/stock', optionalProtect, updateProductStock);  // Update stock only
router.delete('/:id', optionalProtect, deleteProduct);            // Delete product

module.exports = router;
