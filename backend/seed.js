const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const MenuCategory = require('./models/MenuCategory');
const MenuItem = require('./models/MenuItem');
const InventoryItem = require('./models/InventoryItem');
const Staff = require('./models/Staff');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await MenuCategory.deleteMany({});
    await MenuItem.deleteMany({});
    await InventoryItem.deleteMany({});
    await Staff.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@restaurant.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1234567890'
      },
      {
        firstName: 'Manager',
        lastName: 'User',
        email: 'manager@restaurant.com',
        password: 'manager123',
        role: 'manager',
        phone: '+1234567891'
      },
      {
        firstName: 'John',
        lastName: 'Chef',
        email: 'chef@restaurant.com',
        password: 'chef123',
        role: 'staff',
        phone: '+1234567892'
      },
      {
        firstName: 'Jane',
        lastName: 'Waiter',
        email: 'waiter@restaurant.com',
        password: 'waiter123',
        role: 'staff',
        phone: '+1234567893'
      },
      {
        firstName: 'Customer',
        lastName: 'Test',
        email: 'customer@restaurant.com',
        password: 'customer123',
        role: 'customer',
        phone: '+1234567894'
      }
    ]);

    console.log('Created users');

    // Create menu categories
    const categories = await MenuCategory.create([
      {
        name: 'Appetizers',
        description: 'Start your meal with these delicious options',
        displayOrder: 1
      },
      {
        name: 'Main Courses',
        description: 'Hearty and satisfying main dishes',
        displayOrder: 2
      },
      {
        name: 'Desserts',
        description: 'Sweet endings to your meal',
        displayOrder: 3
      },
      {
        name: 'Beverages',
        description: 'Refreshing drinks and beverages',
        displayOrder: 4
      }
    ]);

    console.log('Created menu categories');

    // Create inventory items
    const inventoryItems = await InventoryItem.create([
      {
        name: 'Tomatoes',
        category: 'produce',
        unit: 'kg',
        currentStock: 50,
        minStock: 10,
        maxStock: 100,
        unitCost: 2.50,
        supplier: {
          name: 'Fresh Produce Co',
          contact: '+1234567890',
          email: 'supplier@example.com'
        },
        storageLocation: 'Cold Room A'
      },
      {
        name: 'Chicken Breast',
        category: 'meat',
        unit: 'kg',
        currentStock: 30,
        minStock: 15,
        maxStock: 60,
        unitCost: 8.00,
        supplier: {
          name: 'Quality Meats',
          contact: '+1234567891',
          email: 'meats@example.com'
        },
        storageLocation: 'Freezer B'
      },
      {
        name: 'Mozzarella Cheese',
        category: 'dairy',
        unit: 'kg',
        currentStock: 20,
        minStock: 5,
        maxStock: 40,
        unitCost: 6.50,
        supplier: {
          name: 'Dairy Farm',
          contact: '+1234567892',
          email: 'dairy@example.com'
        },
        storageLocation: 'Cold Room A'
      },
      {
        name: 'Wheat Flour',
        category: 'grains',
        unit: 'kg',
        currentStock: 100,
        minStock: 25,
        maxStock: 200,
        unitCost: 1.20,
        supplier: {
          name: 'Grain Suppliers',
          contact: '+1234567893',
          email: 'grain@example.com'
        },
        storageLocation: 'Pantry C'
      },
      {
        name: 'Olive Oil',
        category: 'packaged',
        unit: 'l',
        currentStock: 15,
        minStock: 5,
        maxStock: 30,
        unitCost: 4.00,
        supplier: {
          name: 'Oil Company',
          contact: '+1234567894',
          email: 'oil@example.com'
        },
        storageLocation: 'Pantry C'
      }
    ]);

    console.log('Created inventory items');

    // Create menu items
    const menuItems = await MenuItem.create([
      {
        name: 'Bruschetta',
        description: 'Toasted bread with tomatoes, garlic, and fresh basil',
        price: 8.99,
        category: categories[0]._id,
        ingredients: [inventoryItems[0]._id, inventoryItems[4]._id],
        dietary: ['vegetarian'],
        spicy: 0,
        preparationTime: 15,
        calories: 180,
        isAvailable: true,
        isFeatured: true
      },
      {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan, croutons, and Caesar dressing',
        price: 10.99,
        category: categories[0]._id,
        ingredients: [inventoryItems[0]._id],
        dietary: ['vegetarian'],
        spicy: 0,
        preparationTime: 10,
        calories: 250,
        isAvailable: true,
        isFeatured: false
      },
      {
        name: 'Grilled Chicken',
        description: 'Juicy grilled chicken breast with herbs and spices',
        price: 18.99,
        category: categories[1]._id,
        ingredients: [inventoryItems[1]._id, inventoryItems[4]._id],
        dietary: [],
        spicy: 1,
        preparationTime: 25,
        calories: 320,
        isAvailable: true,
        isFeatured: true
      },
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        price: 14.99,
        category: categories[1]._id,
        ingredients: [inventoryItems[0]._id, inventoryItems[2]._id, inventoryItems[3]._id],
        dietary: ['vegetarian'],
        spicy: 0,
        preparationTime: 20,
        calories: 280,
        isAvailable: true,
        isFeatured: true
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with chocolate frosting',
        price: 7.99,
        category: categories[2]._id,
        ingredients: [],
        dietary: ['vegetarian'],
        spicy: 0,
        preparationTime: 5,
        calories: 380,
        isAvailable: true,
        isFeatured: false
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 4.99,
        category: categories[3]._id,
        ingredients: [inventoryItems[0]._id],
        dietary: ['vegan', 'gluten-free'],
        spicy: 0,
        preparationTime: 5,
        calories: 110,
        isAvailable: true,
        isFeatured: false
      }
    ]);

    console.log('Created menu items');

    // Create staff records
    const staff = await Staff.create([
      {
        user: users[2]._id,
        employeeId: 'EMP001',
        position: 'chef',
        department: 'kitchen',
        salary: 45000,
        hireDate: new Date('2023-01-15'),
        workSchedule: {
          monday: { start: '09:00', end: '17:00', off: false },
          tuesday: { start: '09:00', end: '17:00', off: false },
          wednesday: { start: '09:00', end: '17:00', off: false },
          thursday: { start: '09:00', end: '17:00', off: false },
          friday: { start: '09:00', end: '17:00', off: false },
          saturday: { start: '09:00', end: '17:00', off: false },
          sunday: { start: '09:00', end: '17:00', off: true }
        },
        contact: {
          emergency: {
            name: 'Emergency Contact',
            phone: '+1234567899',
            relationship: 'Spouse'
          }
        },
        performance: {
          rating: 4.5,
          lastReview: new Date('2024-01-01'),
          notes: 'Excellent performance, reliable team member'
        }
      },
      {
        user: users[3]._id,
        employeeId: 'EMP002',
        position: 'waiter',
        department: 'service',
        salary: 32000,
        hireDate: new Date('2023-03-20'),
        workSchedule: {
          monday: { start: '17:00', end: '23:00', off: false },
          tuesday: { start: '17:00', end: '23:00', off: false },
          wednesday: { start: '17:00', end: '23:00', off: false },
          thursday: { start: '17:00', end: '23:00', off: false },
          friday: { start: '17:00', end: '23:00', off: false },
          saturday: { start: '17:00', end: '23:00', off: false },
          sunday: { start: '17:00', end: '23:00', off: true }
        },
        contact: {
          emergency: {
            name: 'Emergency Contact',
            phone: '+1234567888',
            relationship: 'Parent'
          }
        },
        performance: {
          rating: 4.2,
          lastReview: new Date('2024-01-15'),
          notes: 'Good customer service skills'
        }
      }
    ]);

    console.log('Created staff records');

    // Update user roles for staff
    await User.findByIdAndUpdate(users[2]._id, { role: 'staff' });
    await User.findByIdAndUpdate(users[3]._id, { role: 'staff' });

    console.log('Seed data created successfully!');
    console.log('\n=== Login Credentials ===');
    console.log('Admin: admin@restaurant.com / admin123');
    console.log('Manager: manager@restaurant.com / manager123');
    console.log('Chef: chef@restaurant.com / chef123');
    console.log('Waiter: waiter@restaurant.com / waiter123');
    console.log('Customer: customer@restaurant.com / customer123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seed if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
