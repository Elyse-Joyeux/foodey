# Restaurant Management System - Backend API

A comprehensive restaurant management system backend built with Node.js, Express.js, and MongoDB. This API provides complete functionality for managing restaurant operations including users, menu items, inventory, staff, orders, and analytics.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete CRUD operations for users with different roles
- **Menu Management**: Categories, menu items with customizations, ratings, and images
- **Inventory Management**: Stock tracking, low stock alerts, supplier management
- **Staff Management**: Employee records, attendance tracking, performance reviews
- **Reports & Analytics**: Sales reports, menu performance, staff analytics
- **File Upload**: Image upload for menu items and other assets
- **Input Validation**: Comprehensive validation and error handling
- **Security**: Rate limiting, input sanitization, security headers

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Express-validator** - Input validation
- **Helmet** - Security headers
- **Morgan** - HTTP request logger

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/restaurant
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   ```bash
   # If using MongoDB locally
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### User Management (Admin/Manager only)

#### Get All Users
```http
GET /api/users?page=1&limit=10&role=customer&search=john
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "role": "staff"
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Menu Management

#### Get Menu Categories
```http
GET /api/menu/categories
```

#### Create Menu Category (Admin/Manager)
```http
POST /api/menu/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Appetizers",
  "description": "Start your meal with these delicious options",
  "displayOrder": 1
}
```

#### Get Menu Items
```http
GET /api/menu?page=1&limit=10&category=<categoryId>&search=pizza&isAvailable=true
```

#### Create Menu Item (Admin/Manager)
```http
POST /api/menu
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato sauce, mozzarella, and basil",
  "price": 12.99,
  "category": "<categoryId>",
  "ingredients": ["<ingredientId1>", "<ingredientId2>"],
  "dietary": ["vegetarian"],
  "spicy": 0,
  "preparationTime": 20
}
```

#### Update Menu Item (Admin/Manager)
```http
PUT /api/menu/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 14.99,
  "isAvailable": false
}
```

#### Delete Menu Item (Admin/Manager)
```http
DELETE /api/menu/:id
Authorization: Bearer <token>
```

#### Add Rating to Menu Item
```http
POST /api/menu/:id/rating
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5
}
```

### Inventory Management

#### Get Inventory Items
```http
GET /api/inventory?page=1&limit=10&category=produce&stockStatus=low_stock
Authorization: Bearer <token>
```

#### Get Low Stock Items
```http
GET /api/inventory/low-stock
Authorization: Bearer <token>
```

#### Create Inventory Item (Admin/Manager)
```http
POST /api/inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tomatoes",
  "category": "produce",
  "unit": "kg",
  "currentStock": 50,
  "minStock": 10,
  "maxStock": 100,
  "unitCost": 2.50,
  "supplier": {
    "name": "Fresh Produce Co",
    "contact": "+1234567890",
    "email": "supplier@example.com"
  }
}
```

#### Restock Item
```http
POST /api/inventory/:id/restock
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 25,
  "cost": 2.30,
  "batchNumber": "BATCH001"
}
```

#### Adjust Stock
```http
POST /api/inventory/:id/adjust
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": -5,
  "reason": "Spoilage"
}
```

### Staff Management

#### Get All Staff
```http
GET /api/staff?page=1&limit=10&position=chef&department=kitchen
Authorization: Bearer <token>
```

#### Create Staff Member (Admin)
```http
POST /api/staff
Authorization: Bearer <token>
Content-Type: application/json

{
  "user": "<userId>",
  "employeeId": "EMP001",
  "position": "chef",
  "department": "kitchen",
  "salary": 45000,
  "hireDate": "2024-01-15T00:00:00.000Z"
}
```

#### Record Attendance
```http
POST /api/staff/:id/attendance
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15T00:00:00.000Z",
  "status": "present",
  "checkIn": "09:00",
  "checkOut": "17:00"
}
```

#### Performance Review
```http
POST /api/staff/:id/performance-review
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "notes": "Excellent performance this quarter"
}
```

### Reports & Analytics

#### Sales Report
```http
GET /api/reports/sales?startDate=2024-01-01&endDate=2024-01-31&groupBy=day
Authorization: Bearer <token>
```

#### Menu Performance Report
```http
GET /api/reports/menu-performance?startDate=2024-01-01&endDate=2024-01-31&limit=20
Authorization: Bearer <token>
```

#### Inventory Usage Report
```http
GET /api/reports/inventory-usage?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Staff Performance Report
```http
GET /api/reports/staff-performance?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Customer Analytics Report
```http
GET /api/reports/customer-analytics?startDate=2024-01-01&endDate=2024-01-31&limit=20
Authorization: Bearer <token>
```

#### Dashboard Stats
```http
GET /api/reports/dashboard
Authorization: Bearer <token>
```

### File Upload

#### Upload Single Image
```http
POST /api/upload/menu-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

#### Upload Multiple Images
```http
POST /api/upload/multiple-images
Authorization: Bearer <token>
Content-Type: multipart/form-data

images: <file1>, <file2>, <file3>
```

#### Delete File
```http
DELETE /api/upload/file/:filename
Authorization: Bearer <token>
```

## User Roles

- **admin**: Full access to all features
- **manager**: Access to most features except user deletion
- **staff**: Limited access to assigned features
- **customer**: Can view menu, place orders, manage profile

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": ""
    }
  ]
}
```

## Security Features

- JWT authentication with expiration
- Rate limiting (100 requests per 15 minutes)
- Input sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Security headers via Helmet

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Database Seeding
```bash
npm run seed
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/restaurant |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRE | JWT expiration time | 7d |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
