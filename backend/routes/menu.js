const express = require('express');
const { body, validationResult, query } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/categories', async (req, res) => {
  try {
    const categories = await MenuCategory.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .populate('parentCategory', 'name');

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

router.post('/categories', auth, authorize('admin', 'manager'), [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
  body('displayOrder').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
  body('parentCategory').optional().isMongoId().withMessage('Invalid parent category ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, displayOrder = 0, parentCategory } = req.body;

    const existingCategory = await MenuCategory.findOne({ name, isActive: true });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = new MenuCategory({
      name,
      description,
      displayOrder,
      parentCategory
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating category'
    });
  }
});

router.put('/categories/:id', auth, authorize('admin', 'manager'), [
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
  body('displayOrder').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, displayOrder, isActive } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await MenuCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category'
    });
  }
});

router.delete('/categories/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const category = await MenuCategory.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await MenuItem.updateMany(
      { category: req.params.id },
      { isAvailable: false }
    );

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category'
    });
  }
});

router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isMongoId().withMessage('Invalid category ID'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term cannot be empty'),
  query('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  query('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  query('sortBy').optional().isIn(['name', 'price', 'rating', 'orderCount', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { 
      category, 
      search, 
      isAvailable, 
      isFeatured, 
      dietary, 
      minPrice, 
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (dietary) filter.dietary = { $in: dietary.split(',') };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const menuItems = await MenuItem.find(filter)
      .populate('category', 'name')
      .populate('ingredients', 'name currentStock')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await MenuItem.countDocuments(filter);

    res.json({
      success: true,
      data: {
        menuItems,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu items'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('category', 'name')
      .populate('ingredients', 'name currentStock unit');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: {
        menuItem
      }
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu item'
    });
  }
});

router.post('/', auth, authorize('admin', 'manager'), [
  body('name').trim().notEmpty().withMessage('Menu item name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Invalid category ID'),
  body('preparationTime').optional().isInt({ min: 1 }).withMessage('Preparation time must be at least 1 minute'),
  body('spicy').optional().isInt({ min: 0, max: 5 }).withMessage('Spicy level must be between 0 and 5'),
  body('calories').optional().isInt({ min: 0 }).withMessage('Calories must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      price,
      category,
      image,
      ingredients,
      allergens,
      dietary,
      spicy = 0,
      preparationTime = 15,
      calories,
      isAvailable = true,
      isFeatured = false,
      customizations
    } = req.body;

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      image,
      ingredients,
      allergens,
      dietary,
      spicy,
      preparationTime,
      calories,
      isAvailable,
      isFeatured,
      customizations
    });

    await menuItem.save();
    await menuItem.populate('category', 'name');
    await menuItem.populate('ingredients', 'name currentStock unit');

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: {
        menuItem
      }
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating menu item'
    });
  }
});

router.put('/:id', auth, authorize('admin', 'manager'), [
  body('name').optional().trim().notEmpty().withMessage('Menu item name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isMongoId().withMessage('Invalid category ID'),
  body('preparationTime').optional().isInt({ min: 1 }).withMessage('Preparation time must be at least 1 minute'),
  body('spicy').optional().isInt({ min: 0, max: 5 }).withMessage('Spicy level must be between 0 and 5'),
  body('calories').optional().isInt({ min: 0 }).withMessage('Calories must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updateData = {};
    const allowedFields = [
      'name', 'description', 'price', 'category', 'image', 'ingredients',
      'allergens', 'dietary', 'spicy', 'preparationTime', 'calories',
      'isAvailable', 'isFeatured', 'customizations'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('ingredients', 'name currentStock unit');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: {
        menuItem
      }
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating menu item'
    });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting menu item'
    });
  }
});

router.post('/:id/rating', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { rating } = req.body;

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    const currentTotal = menuItem.rating.average * menuItem.rating.count;
    menuItem.rating.count += 1;
    menuItem.rating.average = (currentTotal + rating) / menuItem.rating.count;

    await menuItem.save();

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: {
        averageRating: menuItem.rating.average,
        totalRatings: menuItem.rating.count
      }
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding rating'
    });
  }
});

router.get('/featured/items', async (req, res) => {
  try {
    const featuredItems = await MenuItem.find({ 
      isAvailable: true, 
      isFeatured: true 
    })
      .populate('category', 'name')
      .sort({ 'rating.average': -1, orderCount: -1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        featuredItems
      }
    });
  } catch (error) {
    console.error('Get featured items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured items'
    });
  }
});

module.exports = router;
