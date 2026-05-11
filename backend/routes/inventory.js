const express = require('express');
const { body, validationResult, query } = require('express-validator');
const InventoryItem = require('../models/InventoryItem');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, authorize('admin', 'manager', 'chef'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['produce', 'dairy', 'meat', 'seafood', 'grains', 'spices', 'beverages', 'packaged', 'other']).withMessage('Invalid category'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term cannot be empty'),
  query('stockStatus').optional().isIn(['in_stock', 'low_stock', 'out_of_stock', 'overstocked']).withMessage('Invalid stock status'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
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
    const { category, search, stockStatus, isActive } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (stockStatus) {
      switch (stockStatus) {
        case 'low_stock':
          filter.$expr = { $lte: ['$currentStock', '$minStock'] };
          break;
        case 'out_of_stock':
          filter.currentStock = 0;
          break;
        case 'overstocked':
          filter.$expr = { $gte: ['$currentStock', '$maxStock'] };
          break;
        case 'in_stock':
          filter.$expr = {
            $and: [
              { $gt: ['$currentStock', 0] },
              { $gt: ['$currentStock', '$minStock'] },
              { $lt: ['$currentStock', '$maxStock'] }
            ]
          };
          break;
      }
    }

    const inventoryItems = await InventoryItem.find(filter)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(limit);

    const itemsWithStatus = inventoryItems.map(item => ({
      ...item.toObject(),
      isLowStock: item.currentStock <= item.minStock,
      stockStatus: item.stockStatus
    }));

    const total = await InventoryItem.countDocuments(filter);

    res.json({
      success: true,
      data: {
        inventoryItems: itemsWithStatus,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory items'
    });
  }
});

router.get('/low-stock', auth, authorize('admin', 'manager', 'chef'), async (req, res) => {
  try {
    const lowStockItems = await InventoryItem.find({
      $expr: { $lte: ['$currentStock', '$minStock'] },
      isActive: true
    })
      .sort({ currentStock: 1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        lowStockItems
      }
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching low stock items'
    });
  }
});

router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await InventoryItem.distinct('category', { isActive: true });
    
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const items = await InventoryItem.find({ category, isActive: true });
        const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
        const lowStockCount = items.filter(item => item.currentStock <= item.minStock).length;
        
        return {
          name: category,
          itemCount: items.length,
          totalValue,
          lowStockCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        categories: categoryStats
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

router.get('/:id', auth, authorize('admin', 'manager', 'chef'), async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const itemWithStatus = {
      ...inventoryItem.toObject(),
      isLowStock: inventoryItem.currentStock <= inventoryItem.minStock,
      stockStatus: inventoryItem.stockStatus
    };

    res.json({
      success: true,
      data: {
        inventoryItem: itemWithStatus
      }
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory item'
    });
  }
});

router.post('/', auth, authorize('admin', 'manager'), [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('category').isIn(['produce', 'dairy', 'meat', 'seafood', 'grains', 'spices', 'beverages', 'packaged', 'other']).withMessage('Invalid category'),
  body('unit').isIn(['kg', 'g', 'l', 'ml', 'pieces', 'boxes', 'bottles', 'cans', 'dozen']).withMessage('Invalid unit'),
  body('currentStock').isFloat({ min: 0 }).withMessage('Current stock must be a non-negative number'),
  body('minStock').isFloat({ min: 0 }).withMessage('Minimum stock must be a non-negative number'),
  body('maxStock').isFloat({ min: 0 }).withMessage('Maximum stock must be a non-negative number'),
  body('unitCost').isFloat({ min: 0 }).withMessage('Unit cost must be a non-negative number')
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
      category,
      unit,
      currentStock,
      minStock,
      maxStock,
      unitCost,
      supplier,
      image,
      storageLocation,
      expiryDate,
      batchNumber
    } = req.body;

    if (minStock >= maxStock) {
      return res.status(400).json({
        success: false,
        message: 'Minimum stock must be less than maximum stock'
      });
    }

    const existingItem = await InventoryItem.findOne({ name, isActive: true });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item with this name already exists'
      });
    }

    const inventoryItem = new InventoryItem({
      name,
      description,
      category,
      unit,
      currentStock,
      minStock,
      maxStock,
      unitCost,
      supplier,
      image,
      storageLocation,
      expiryDate,
      batchNumber
    });

    await inventoryItem.save();

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: {
        inventoryItem
      }
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating inventory item'
    });
  }
});

router.put('/:id', auth, authorize('admin', 'manager'), [
  body('name').optional().trim().notEmpty().withMessage('Item name cannot be empty'),
  body('category').optional().isIn(['produce', 'dairy', 'meat', 'seafood', 'grains', 'spices', 'beverages', 'packaged', 'other']).withMessage('Invalid category'),
  body('unit').optional().isIn(['kg', 'g', 'l', 'ml', 'pieces', 'boxes', 'bottles', 'cans', 'dozen']).withMessage('Invalid unit'),
  body('currentStock').optional().isFloat({ min: 0 }).withMessage('Current stock must be a non-negative number'),
  body('minStock').optional().isFloat({ min: 0 }).withMessage('Minimum stock must be a non-negative number'),
  body('maxStock').optional().isFloat({ min: 0 }).withMessage('Maximum stock must be a non-negative number'),
  body('unitCost').optional().isFloat({ min: 0 }).withMessage('Unit cost must be a non-negative number')
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
      'name', 'description', 'category', 'unit', 'currentStock', 'minStock',
      'maxStock', 'unitCost', 'supplier', 'image', 'storageLocation',
      'expiryDate', 'batchNumber', 'isActive'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.minStock && updateData.maxStock && updateData.minStock >= updateData.maxStock) {
      return res.status(400).json({
        success: false,
        message: 'Minimum stock must be less than maximum stock'
      });
    }

    const inventoryItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: {
        inventoryItem
      }
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating inventory item'
    });
  }
});

router.post('/:id/restock', auth, authorize('admin', 'manager'), [
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a non-negative number'),
  body('batchNumber').optional().trim().notEmpty().withMessage('Batch number cannot be empty'),
  body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date format')
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

    const { quantity, cost, batchNumber, expiryDate } = req.body;

    const inventoryItem = await InventoryItem.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    inventoryItem.currentStock += quantity;
    inventoryItem.lastRestocked = new Date();
    
    if (cost) inventoryItem.unitCost = cost;
    if (batchNumber) inventoryItem.batchNumber = batchNumber;
    if (expiryDate) inventoryItem.expiryDate = new Date(expiryDate);

    await inventoryItem.save();

    res.json({
      success: true,
      message: 'Item restocked successfully',
      data: {
        inventoryItem,
        restockedQuantity: quantity
      }
    });
  } catch (error) {
    console.error('Restock item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while restocking item'
    });
  }
});

router.post('/:id/adjust', auth, authorize('admin', 'manager'), [
  body('quantity').isFloat().withMessage('Quantity is required'),
  body('reason').trim().notEmpty().withMessage('Reason for adjustment is required')
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

    const { quantity, reason } = req.body;

    const inventoryItem = await InventoryItem.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const newStock = inventoryItem.currentStock + quantity;
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reduce stock below zero'
      });
    }

    inventoryItem.currentStock = newStock;
    await inventoryItem.save();

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        inventoryItem,
        adjustment: {
          quantity,
          reason,
          previousStock: inventoryItem.currentStock - quantity,
          newStock
        }
      }
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adjusting stock'
    });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting inventory item'
    });
  }
});

router.get('/stats/dashboard', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const totalItems = await InventoryItem.countDocuments({ isActive: true });
    const lowStockItems = await InventoryItem.countDocuments({
      $expr: { $lte: ['$currentStock', '$minStock'] },
      isActive: true
    });
    const outOfStockItems = await InventoryItem.countDocuments({
      currentStock: 0,
      isActive: true
    });

    const categoryStats = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$currentStock', '$unitCost'] } },
          lowStockCount: {
            $sum: {
              $cond: [
                { $lte: ['$currentStock', '$minStock'] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    const recentRestocks = await InventoryItem.find({ isActive: true })
      .sort({ lastRestocked: -1 })
      .limit(5)
      .select('name lastRestocked currentStock minStock unit');

    res.json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        inStockItems: totalItems - lowStockItems - outOfStockItems,
        categoryStats,
        recentRestocks
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
});

module.exports = router;
