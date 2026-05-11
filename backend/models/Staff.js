const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: ['chef', 'cook', 'waiter', 'host', 'manager', 'cashier', 'cleaner', 'bartender', 'sous_chef', 'pastry_chef']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['kitchen', 'service', 'management', 'cleaning', 'bar']
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
    default: Date.now
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  workSchedule: {
    monday: { start: String, end: String, off: Boolean },
    tuesday: { start: String, end: String, off: Boolean },
    wednesday: { start: String, end: String, off: Boolean },
    thursday: { start: String, end: String, off: Boolean },
    friday: { start: String, end: String, off: Boolean },
    saturday: { start: String, end: String, off: Boolean },
    sunday: { start: String, end: String, off: Boolean }
  },
  contact: {
    emergency: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  documents: {
    contract: {
      type: String,
      default: ''
    },
    idDocument: {
      type: String,
      default: ''
    },
    certifications: [{
      name: String,
      file: String,
      expiryDate: Date
    }]
  },
  performance: {
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    lastReview: Date,
    notes: String
  },
  attendance: [{
    date: Date,
    checkIn: String,
    checkOut: String,
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'leave'],
      default: 'present'
    },
    notes: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  terminationDate: Date,
  terminationReason: String
}, {
  timestamps: true
});

staffSchema.index({ employeeId: 1 });
staffSchema.index({ position: 1, department: 1 });
staffSchema.index({ isActive: 1 });

module.exports = mongoose.model('Staff', staffSchema);
