const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products (for pharmacy - full details)
// @route   GET /api/products
// @access  Private/Public
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    const formattedProducts = products.map(p => p.toInventoryFormat());
    res.json(formattedProducts);
});

// @desc    Get products for store (simplified for patients)
// @route   GET /api/products/store
// @access  Public
const getStoreProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ isActive: true }).sort({ category: 1, name: 1 });
    const formattedProducts = products.map(p => p.toStoreFormat());
    res.json(formattedProducts);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private/Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.json(product.toInventoryFormat());
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
    const { name, category, price, stock, minStock, image, prescription, supplier } = req.body;

    if (!name || !category || price === undefined) {
        res.status(400);
        throw new Error('Please provide name, category, and price');
    }

    const product = await Product.create({
        name,
        category,
        price,
        stock: stock || 0,
        minStock: minStock || 10,
        image: image || '💊',
        prescription: prescription || false,
        supplier: supplier || '',
        lastRestocked: new Date()
    });

    res.status(201).json(product.toInventoryFormat());
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const { name, category, price, stock, minStock, image, prescription, supplier } = req.body;

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) {
        product.stock = stock;
        product.lastRestocked = new Date();
    }
    if (minStock !== undefined) product.minStock = minStock;
    if (image !== undefined) product.image = image;
    if (prescription !== undefined) product.prescription = prescription;
    if (supplier !== undefined) product.supplier = supplier;

    await product.save();

    res.json(product.toInventoryFormat());
});

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private
const updateProductStock = asyncHandler(async (req, res) => {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
        res.status(400);
        throw new Error('Invalid stock value');
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    product.stock = stock;
    product.lastRestocked = new Date();
    await product.save();

    res.json(product.toInventoryFormat());
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = ['Pain Relief', 'Heart Health', 'Allergy', 'Diabetes', 'Supplements', 'Digestive', 'Devices', 'Antibiotics', 'Other'];
    res.json(categories);
});

module.exports = {
    getProducts,
    getStoreProducts,
    getProductById,
    createProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    getCategories
};
