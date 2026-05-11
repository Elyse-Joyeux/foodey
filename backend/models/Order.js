const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  customizations: [{
    name: String,
    selectedOptions: [String]
  }],
  specialInstructions: {
    type: String,
    trim: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['dine_in', 'takeaway', 'delivery'],
    required: true
  },
  tableNumber: {
    type: String,
    trim: true
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discount: {
    type: Number,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile', 'online'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },
  estimatedTime: {
    type: Number,
    min: 1
  },
  actualTime: {
    type: Number
  },
  notes: {
    type: String,
    trim: true
  },
  staff: {
    waiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  }
}, {
  timestamps: true
});

orderSchema.pre('save', function(next) {
  if (this.isNew) {
    const date = new Date();
    const timestamp = date.getTime();
    this.orderNumber = `ORD${timestamp}`;
  }
  next();
});

orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, orderType: 1 });

module.exports = mongoose.model('Order', orderSchema);
