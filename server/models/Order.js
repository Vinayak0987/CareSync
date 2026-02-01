const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    patientName: {
        type: String,
        required: true
    },
    patientAvatar: {
        type: String,
        default: ''
    },
    items: [orderItemSchema],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'dispatched', 'delivered', 'cancelled'],
        default: 'pending'
    },
    prescription: {
        type: Boolean,
        default: false
    },
    prescriptionVerified: {
        type: Boolean,
        default: false
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Format order date for frontend
orderSchema.methods.getFormattedDate = function () {
    return this.orderDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }) + ', ' + this.orderDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

// Transform to frontend format
orderSchema.methods.toFrontendFormat = function () {
    return {
        id: this.orderId,
        patientName: this.patientName,
        patientAvatar: this.patientAvatar,
        items: this.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: this.total,
        status: this.status,
        prescription: this.prescription,
        prescriptionVerified: this.prescriptionVerified,
        deliveryAddress: this.deliveryAddress,
        orderDate: this.getFormattedDate()
    };
};

module.exports = mongoose.model('Order', orderSchema);
