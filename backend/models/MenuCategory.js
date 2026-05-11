const mongoose = require('mongoose');

const menuCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  image: {
    type: String,
    default: ''
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuCategory',
    default: null
  }
}, {
  timestamps: true
});

menuCategorySchema.index({ displayOrder: 1, isActive: 1 });

module.exports = mongoose.model('MenuCategory', menuCategorySchema);
