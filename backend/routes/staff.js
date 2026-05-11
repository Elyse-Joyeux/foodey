const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Staff = require('../models/Staff');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, authorize('admin', 'manager'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('position').optional().isIn(['chef', 'cook', 'waiter', 'host', 'manager', 'cashier', 'cleaner', 'bartender', 'sous_chef', 'pastry_chef']).withMessage('Invalid position'),
  query('department').optional().isIn(['kitchen', 'service', 'management', 'cleaning', 'bar']).withMessage('Invalid department'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term cannot be empty')
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
    const { position, department, isActive, search } = req.query;

    const filter = {};
    if (position) filter.position = position;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    let staffQuery = Staff.find(filter).populate({
      path: 'user',
      select: 'firstName lastName email phone avatar'
    });

    if (search) {
      staffQuery = staffQuery.populate({
        path: 'user',
        match: {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        },
        select: 'firstName lastName email phone avatar'
      });
    }

    const staff = await staffQuery
      .sort({ hireDate: -1 })
      .skip(skip)
      .limit(limit);

    const filteredStaff = staff.filter(s => s.user);

    const total = await Staff.countDocuments(filter);

    res.json({
      success: true,
      data: {
        staff: filteredStaff,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff'
    });
  }
});

router.get('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'firstName lastName email phone avatar preferences'
      });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: {
        staff
      }
    });
  } catch (error) {
    console.error('Get staff member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff member'
    });
  }
});

router.post('/', auth, authorize('admin'), [
  body('user').isMongoId().withMessage('Valid user ID is required'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('position').isIn(['chef', 'cook', 'waiter', 'host', 'manager', 'cashier', 'cleaner', 'bartender', 'sous_chef', 'pastry_chef']).withMessage('Invalid position'),
  body('department').isIn(['kitchen', 'service', 'management', 'cleaning', 'bar']).withMessage('Invalid department'),
  body('salary').isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('hireDate').isISO8601().withMessage('Invalid hire date format')
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
      user,
      employeeId,
      position,
      department,
      salary,
      hireDate,
      workSchedule,
      contact,
      documents
    } = req.body;

    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingStaff = await Staff.findOne({ user });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Staff record already exists for this user'
      });
    }

    const existingEmployeeId = await Staff.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    const staff = new Staff({
      user,
      employeeId,
      position,
      department,
      salary,
      hireDate: new Date(hireDate),
      workSchedule,
      contact,
      documents
    });

    await staff.save();

    await User.findByIdAndUpdate(user, { role: 'staff' });

    const populatedStaff = await Staff.findById(staff._id)
      .populate({
        path: 'user',
        select: 'firstName lastName email phone avatar'
      });

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        staff: populatedStaff
      }
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating staff member'
    });
  }
});

router.put('/:id', auth, authorize('admin'), [
  body('position').optional().isIn(['chef', 'cook', 'waiter', 'host', 'manager', 'cashier', 'cleaner', 'bartender', 'sous_chef', 'pastry_chef']).withMessage('Invalid position'),
  body('department').optional().isIn(['kitchen', 'service', 'management', 'cleaning', 'bar']).withMessage('Invalid department'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number')
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
      'position', 'department', 'salary', 'workSchedule', 'contact',
      'documents', 'performance', 'isActive'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'user',
        select: 'firstName lastName email phone avatar'
      });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: {
        staff
      }
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating staff member'
    });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false,
        terminationDate: new Date(),
        terminationReason: 'Terminated by admin'
      },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    await User.findByIdAndUpdate(staff.user, { isActive: false });

    res.json({
      success: true,
      message: 'Staff member terminated successfully'
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while terminating staff member'
    });
  }
});

router.post('/:id/attendance', auth, authorize('admin', 'manager'), [
  body('date').isISO8601().withMessage('Invalid date format'),
  body('status').isIn(['present', 'absent', 'late', 'leave']).withMessage('Invalid status'),
  body('checkIn').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid check-in time format (HH:MM)'),
  body('checkOut').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid check-out time format (HH:MM)')
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

    const { date, status, checkIn, checkOut, notes } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const existingAttendance = staff.attendance.find(
      a => a.date.toDateString() === new Date(date).toDateString()
    );

    if (existingAttendance) {
      existingAttendance.status = status;
      existingAttendance.checkIn = checkIn;
      existingAttendance.checkOut = checkOut;
      existingAttendance.notes = notes;
    } else {
      staff.attendance.push({
        date: new Date(date),
        status,
        checkIn,
        checkOut,
        notes
      });
    }

    await staff.save();

    res.json({
      success: true,
      message: 'Attendance recorded successfully'
    });
  } catch (error) {
    console.error('Record attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording attendance'
    });
  }
});

router.get('/:id/attendance', auth, authorize('admin', 'manager', 'staff'), [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
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
    const staffId = req.params.id;

    if (req.user.role === 'staff' && req.user._id.toString() !== staffId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own attendance.'
      });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    let attendance = staff.attendance;

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      
      attendance = attendance.filter(a => 
        a.date >= start && a.date <= end
      );
    }

    attendance.sort((a, b) => b.date - a.date);

    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      leave: attendance.filter(a => a.status === 'leave').length
    };

    res.json({
      success: true,
      data: {
        attendance,
        stats
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance'
    });
  }
});

router.post('/:id/performance-review', auth, authorize('admin', 'manager'), [
  body('rating').isInt({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
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

    const { rating, notes } = req.body;

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      {
        'performance.rating': rating,
        'performance.lastReview': new Date(),
        'performance.notes': notes
      },
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Performance review recorded successfully',
      data: {
        rating: staff.performance.rating,
        lastReview: staff.performance.lastReview
      }
    });
  } catch (error) {
    console.error('Performance review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording performance review'
    });
  }
});

router.get('/stats/dashboard', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments({ isActive: true });
    const staffByDepartment = await Staff.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const staffByPosition = await Staff.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$position', count: { $sum: 1 } } }
    ]);

    const recentHires = await Staff.find({ isActive: true })
      .populate({
        path: 'user',
        select: 'firstName lastName avatar'
      })
      .sort({ hireDate: -1 })
      .limit(5);

    const attendanceStats = await Staff.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$attendance' },
      {
        $group: {
          _id: '$attendance.status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalStaff,
        staffByDepartment,
        staffByPosition,
        recentHires,
        attendanceStats
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
