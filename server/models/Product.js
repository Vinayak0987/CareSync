const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [3, 'Product name must be at least 3 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Pain Relief', 'Heart Health', 'Allergy', 'Diabetes', 'Supplements', 'Digestive', 'Devices', 'Antibiotics', 'Other']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        max: [100000, 'Price cannot exceed 100000']
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    minStock: {
        type: Number,
        default: 10,
        min: [0, 'Minimum stock cannot be negative']
    },
    image: {
        type: String,
        default: '💊'
    },
    prescription: {
        type: Boolean,
        default: false
    },
    supplier: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['in-stock', 'low-stock', 'out-of-stock'],
        default: 'in-stock'
    },
    lastRestocked: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Pre-save middleware to update status based on stock
productSchema.pre('save', function () {
    if (this.stock === 0) {
        this.status = 'out-of-stock';
    } else if (this.stock < this.minStock) {
        this.status = 'low-stock';
    } else {
        this.status = 'in-stock';
    }
});

// Transform to pharmacy dashboard format
productSchema.methods.toInventoryFormat = function () {
    return {
        id: this._id.toString(),
        name: this.name,
        category: this.category,
        price: this.price,
        stock: this.stock,
        minStock: this.minStock,
        status: this.status,
        image: this.image,
        prescription: this.prescription,
        supplier: this.supplier,
        lastRestocked: this.lastRestocked.toISOString().split('T')[0]
    };
};

// Transform to patient store format
productSchema.methods.toStoreFormat = function () {
    return {
        id: this._id.toString(),
        name: this.name,
        category: this.category,
        price: this.price,
        image: this.image,
        inStock: this.status !== 'out-of-stock',
        prescription: this.prescription
    };
};

module.exports = mongoose.model('Product', productSchema);
