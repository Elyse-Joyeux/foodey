# MongoDB Web Browser Connection Guide

This guide will help you connect to your MongoDB database using web-based tools.

## Option 1: MongoDB Atlas (Cloud-based)

### Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Create a free account

### Step 2: Create a Cluster
1. After signing in, click "Build a Database"
2. Select "M0 Sandbox" (Free tier)
3. Choose your preferred cloud provider and region
4. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Enter username and password
4. Select "Read and write to any database"
5. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Copy the connection string
5. Replace `<password>` with your database user password

### Step 6: Update Your .env File
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority
```

## Option 2: MongoDB Compass (Desktop GUI)

### Step 1: Download MongoDB Compass
1. Go to [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
2. Download and install MongoDB Compass for your OS

### Step 2: Connect to Local MongoDB
If you have MongoDB running locally:
1. Open MongoDB Compass
2. Enter connection string: `mongodb://localhost:27017`
3. Click "Connect"

### Step 3: Connect to MongoDB Atlas
1. Open MongoDB Compass
2. Click "New Connection"
3. Paste your Atlas connection string
4. Replace `<password>` with your actual password
5. Click "Connect"

## Option 3: Local MongoDB Installation

### Step 1: Install MongoDB
**Windows:**
1. Download from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB Compass (included)

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

### Step 2: Verify Installation
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ismaster')"

# Or for older versions
mongo --eval "db.adminCommand('ismaster')"
```

## Option 4: Web-based MongoDB GUIs

### 1. Mongo Express
```bash
# Install globally
npm install -g mongo-express

# Run with connection string
mongo-express -u <username> -p <password> -d restaurant

# Or with connection string
mongo-express -c "mongodb://localhost:27017/restaurant"
```
Then visit `http://localhost:8081`

### 2. Studio 3T
1. Download from [https://studio3t.com/](https://studio3t.com/)
2. Install and connect using your connection string

## Update Your Backend Configuration

### For Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/restaurant
```

### For MongoDB Atlas
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority
```

## Test Your Connection

### Method 1: Using Node.js
```bash
cd backend
npm run seed
```

### Method 2: Using MongoDB Shell
```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/restaurant"

# List collections
show collections

# Show data
db.users.find().pretty()
```

## Troubleshooting

### Common Issues:
1. **Connection Refused**: Make sure MongoDB is running
2. **Authentication Failed**: Check username/password in connection string
3. **Network Timeout**: Check firewall and IP whitelist settings
4. **Database Not Found**: MongoDB will create the database on first use

### MongoDB Commands:
```bash
# Start MongoDB
mongod

# Stop MongoDB
sudo systemctl stop mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## Recommended Setup for Development

For your restaurant project, I recommend:

1. **Local MongoDB** for development (faster, offline capable)
2. **MongoDB Atlas** for production (scalable, managed)
3. **MongoDB Compass** for database management
4. **Mongo Express** for quick web access

## Security Notes

1. Never commit passwords to version control
2. Use environment variables for sensitive data
3. Enable authentication in production
4. Use IP whitelisting for cloud databases
5. Regular backups for production data

## Next Steps

Once connected:
1. Run `npm run seed` to populate test data
2. Start your backend with `npm run dev`
3. Access API at `http://localhost:5000/api/health`
4. Use MongoDB Compass to browse your data
