const express = require('express');
const { query, validationResult } = require('express-validator');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const InventoryItem = require('../models/InventoryItem');
const Staff = require('../models/Staff');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/sales', auth, authorize('admin', 'manager'), [
  query('startDate').isISO8601().withMessage('Invalid start date format'),
  query('endDate').isISO8601().withMessage('Invalid end date format'),
  query('groupBy').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid group by option')
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

    const { startDate, endDate, groupBy = 'day' } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Define date format for grouping (day/week/month/year)
    const groupFormat = {
      day: '%Y-%m-%d',
      week: '%Y-%U',
      month: '%Y-%m',
      year: '%Y'
    };

    const salesData = await Order.aggregate([
      {
        // Match only completed/served orders that are paid
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'served'] },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat[groupBy],
              date: '$createdAt'
            }
          },
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'served'] },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        summary: totalSales[0] || { totalSales: 0, totalOrders: 0, averageOrderValue: 0 }
      }
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating sales report'
    });
  }
});

router.get('/menu-performance', auth, authorize('admin', 'manager'), [
  query('startDate').isISO8601().withMessage('Invalid start date format'),
  query('endDate').isISO8601().withMessage('Invalid end date format'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const { startDate, endDate, limit = 20 } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const menuPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'served'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orderCount: { $addToSet: '$orderNumber' }
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$orderCount' }
        }
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $project: {
          menuItemName: '$menuItem.name',
          categoryName: '$menuItem.category',
          price: '$menuItem.price',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          averageRevenuePerOrder: { $divide: ['$totalRevenue', '$orderCount'] }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    const categoryPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'served'] }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $lookup: {
          from: 'menucategories',
          localField: 'menuItem.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orderCount: { $addToSet: '$orderNumber' }
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$orderCount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        menuPerformance,
        categoryPerformance
      }
    });
  } catch (error) {
    console.error('Menu performance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating menu performance report'
    });
  }
});

router.get('/inventory-usage', auth, authorize('admin', 'manager', 'chef'), [
  query('startDate').isISO8601().withMessage('Invalid start date format'),
  query('endDate').isISO8601().withMessage('Invalid end date format')
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

    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const inventoryUsage = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'served'] }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      { $unwind: '$menuItem.ingredients' },
      {
        $lookup: {
          from: 'inventoryitems',
          localField: 'menuItem.ingredients',
          foreignField: '_id',
          as: 'inventoryItem'
        }
      },
      { $unwind: '$inventoryItem' },
      {
        $group: {
          _id: '$inventoryItem._id',
          itemName: { $first: '$inventoryItem.name' },
          category: { $first: '$inventoryItem.category' },
          unit: { $first: '$inventoryItem.unit' },
          totalUsage: { $sum: '$items.quantity' },
          usageCount: { $sum: 1 }
        }
      },
      { $sort: { totalUsage: -1 } }
    ]);

    const currentInventory = await InventoryItem.find({ isActive: true })
      .select('name category currentStock minStock maxStock unit');

    const inventoryWithUsage = currentInventory.map(item => {
      const usage = inventoryUsage.find(u => u._id.toString() === item._id.toString());
      return {
        ...item.toObject(),
        usage: usage ? {
          totalUsage: usage.totalUsage,
          usageCount: usage.usageCount
        } : { totalUsage: 0, usageCount: 0 }
      };
    });

    res.json({
      success: true,
      data: {
        inventoryWithUsage
      }
    });
  } catch (error) {
    console.error('Inventory usage report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating inventory usage report'
    });
  }
});

router.get('/staff-performance', auth, authorize('admin', 'manager'), [
  query('startDate').isISO8601().withMessage('Invalid start date format'),
  query('endDate').isISO8601().withMessage('Invalid end date format')
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

    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const staffPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'served'] }
        }
      },
      {
        $lookup: {
          from: 'staff',
          localField: 'staff.waiter',
          foreignField: '_id',
          as: 'waiter'
        }
      },
      {
        $lookup: {
          from: 'staff',
          localField: 'staff.chef',
          foreignField: '_id',
          as: 'chef'
        }
      },
      { $unwind: { path: '$waiter', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$chef', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$waiter._id',
          waiterName: { $first: { $concat: ['$waiter.user.firstName', ' ', '$waiter.user.lastName'] } },
          position: { $first: '$waiter.position' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { totalRevenue: -1 } }
    ]);

    const chefPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'served'] }
        }
      },
      {
        $lookup: {
          from: 'staff',
          localField: 'staff.chef',
          foreignField: '_id',
          as: 'chef'
        }
      },
      { $unwind: { path: '$chef', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$chef._id',
          chefName: { $first: { $concat: ['$chef.user.firstName', ' ', '$chef.user.lastName'] } },
          position: { $first: '$chef.position' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averagePrepTime: { $avg: '$actualTime' }
        }
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { totalRevenue: -1 } }
    ]);

    const staffAttendance = await Staff.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$attendance' },
      {
        $match: {
          'attendance.date': { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user._id',
          staffName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          position: { $first: '$position' },
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [{ $eq: ['$attendance.status', 'present'] }, 1, 0]
            }
          },
          absentDays: {
            $sum: {
              $cond: [{ $eq: ['$attendance.status', 'absent'] }, 1, 0]
            }
          },
          lateDays: {
            $sum: {
              $cond: [{ $eq: ['$attendance.status', 'late'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          attendanceRate: {
            $multiply: [
              { $divide: ['$presentDays', '$totalDays'] },
              100
            ]
          }
        }
      },
      { $sort: { attendanceRate: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        staffPerformance,
        chefPerformance,
        staffAttendance
      }
    });
  } catch (error) {
    console.error('Staff performance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating staff performance report'
    });
  }
});

router.get('/customer-analytics', auth, authorize('admin', 'manager'), [
  query('startDate').isISO8601().withMessage('Invalid start date format'),
  query('endDate').isISO8601().withMessage('Invalid end date format'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const { startDate, endDate, limit = 20 } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const topCustomers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'served'] },
          paymentStatus: 'paid'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customer',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $group: {
          _id: '$customer._id',
          customerName: { $first: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] } },
          email: { $first: '$customer.email' },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: parseInt(limit) }
    ]);

    const orderTypeStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'served'] }
        }
      },
      {
        $group: {
          _id: '$orderType',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    const newVsReturningCustomers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'served'] }
        }
      },
      {
        $lookup: {
          from: 'orders',
          let: { customerId: '$customer' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$customer', '$$customerId'] },
                    { $lt: ['$createdAt', start] }
                  ]
                }
              }
            }
          ],
          as: 'previousOrders'
        }
      },
      {
        $addFields: {
          customerType: {
            $cond: {
              if: { $gt: [{ $size: '$previousOrders' }, 0] },
              then: 'returning',
              else: 'new'
            }
          }
        }
      },
      {
        $group: {
          _id: '$customerType',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        topCustomers,
        orderTypeStats,
        newVsReturningCustomers
      }
    });
  } catch (error) {
    console.error('Customer analytics report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating customer analytics report'
    });
  }
});

router.get('/dashboard', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayOrders,
      weekOrders,
      monthOrders,
      totalMenuItems,
      lowStockItems,
      totalStaff,
      activeStaff
    ] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: startOfToday },
        status: { $in: ['completed', 'served'] }
      }),
      Order.countDocuments({
        createdAt: { $gte: startOfWeek },
        status: { $in: ['completed', 'served'] }
      }),
      Order.countDocuments({
        createdAt: { $gte: startOfMonth },
        status: { $in: ['completed', 'served'] }
      }),
      MenuItem.countDocuments({ isAvailable: true }),
      InventoryItem.countDocuments({
        $expr: { $lte: ['$currentStock', '$minStock'] },
        isActive: true
      }),
      Staff.countDocuments({ isActive: true }),
      Staff.countDocuments({ 
        isActive: true,
        'attendance.date': startOfToday,
        'attendance.status': 'present'
      })
    ]);

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday },
          status: { $in: ['completed', 'served'] },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        orders: {
          today: todayOrders,
          week: weekOrders,
          month: monthOrders
        },
        revenue: {
          today: todayRevenue[0]?.total || 0
        },
        menu: {
          totalItems: totalMenuItems,
          lowStockItems
        },
        staff: {
          total: totalStaff,
          activeToday: activeStaff
        }
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
