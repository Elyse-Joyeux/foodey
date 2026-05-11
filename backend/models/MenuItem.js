const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuCategory',
    required: [true, 'Category is required']
  },
  image: {
    type: String,
    default: ''
  },
  ingredients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem'
  }],
  allergens: [{
    type: String,
    enum: ['gluten', 'dairy', 'nuts', 'soy', 'eggs', 'fish', 'shellfish', 'sesame', 'none']
  }],
  dietary: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'halal', 'kosher']
  }],
  spicy: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  preparationTime: {
    type: Number,
    min: 1,
    default: 15
  },
  calories: {
    type: Number,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  orderCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  customizations: [{
    name: {
      type: String,
      required: true
    },
    options: [{
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        default: 0
      }
    }],
    required: {
      type: Boolean,
      default: false
    },
    multipleSelection: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
