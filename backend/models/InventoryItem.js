const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['produce', 'dairy', 'meat', 'seafood', 'grains', 'spices', 'beverages', 'packaged', 'other'] // Type of inventory item
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'g', 'l', 'ml', 'pieces', 'boxes', 'bottles', 'cans', 'dozen']
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Stock cannot be negative'] // Actual quantity in stock
  },
  minStock: {
    type: Number,
    required: [true, 'Minimum stock is required'],
    min: [0, 'Minimum stock cannot be negative'] // Alert when stock falls below this
  },
  maxStock: {
    type: Number,
    required: [true, 'Maximum stock is required'],
    min: [0, 'Maximum stock cannot be negative'] // Maximum recommended stock level
  },
  unitCost: {
    type: Number,
    required: [true, 'Unit cost is required'],
    min: [0, 'Unit cost cannot be negative'] // Cost per unit for expense calculation
  },
  supplier: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  image: {
    type: String,
    default: ''
  },
  storageLocation: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date // Track perishable items expiration
  },
  batchNumber: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

inventoryItemSchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.minStock;
});

inventoryItemSchema.virtual('stockStatus').get(function() {
  if (this.currentStock === 0) return 'out_of_stock';
  if (this.currentStock <= this.minStock) return 'low_stock';
  if (this.currentStock >= this.maxStock) return 'overstocked';
  return 'in_stock';
});

inventoryItemSchema.index({ name: 'text', description: 'text' });
inventoryItemSchema.index({ category: 1, isActive: 1 });
inventoryItemSchema.index({ currentStock: 1, minStock: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
