# 🗄️ AJA Timesheet Database Setup Guide

## 📋 Prerequisites
- Access to your hosted backend at `http://ajabackend.khumo.co.bw/`
- MySQL database access (via cPanel or hosting control panel)
- SSH/Terminal access to your server

## 🚀 Database Setup Steps

### Step 1: Create Database and User in cPanel

1. **Login to cPanel**
2. **Go to MySQL Databases**
3. **Create Database**:
   - Database name: `khumocob_aja`
   - Click "Create Database"
4. **Create Database User**:
   - Username: `khumocob_aja`
   - Password: `khumocob_aja`
   - Click "Create User"
5. **Add User to Database**:
   - Select user: `khumocob_aja`
   - Select database: `khumocob_aja`
   - Check "ALL PRIVILEGES"
   - Click "Add"

### Step 2: Upload Backend Files

1. **Upload all backend files** to your server
2. **Ensure `.env` file is configured**:
   ```env
   PORT=3000
   NODE_ENV=production
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=khumocob_aja
   DB_USER=khumocob_aja
   DB_PASSWORD=khumocob_aja
   JWT_SECRET=aja-timesheet-super-secret-jwt-key-2024
   FRONTEND_URL=http://aja.khumo.co.bw
   ```

### Step 3: Run Database Setup Scripts

#### Option A: Using SSH/Terminal
```bash
# Connect to your server
ssh yourdomain.com

# Navigate to backend directory
cd /path/to/your/backend

# Install dependencies
npm install

# Run database setup
node setup.js
node create-tables.js
```

#### Option B: Using cPanel Terminal
1. **Open Terminal** in cPanel
2. **Navigate to backend directory**:
   ```bash
   cd /path/to/your/backend
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run setup scripts**:
   ```bash
   node setup.js
   node create-tables.js
   ```

### Step 4: Verify Database Setup

#### Test Database Connection:
```bash
# Test the connection
node -e "
const mysql = require('mysql2/promise');
async function test() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'khumocob_aja',
      password: 'khumocob_aja',
      database: 'khumocob_aja'
    });
    console.log('✅ Database connection successful!');
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}
test();
"
```

#### Test API Endpoints:
```bash
# Test health endpoint
curl http://ajabackend.khumo.co.bw/health

# Test login endpoint
curl -X POST http://ajabackend.khumo.co.bw/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aja.com","password":"admin123"}'
```

## 📊 Database Schema

The setup scripts will create the following tables:

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('ADMIN', 'SUPERVISOR', 'STAFF') NOT NULL,
  department VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Timesheet Entries Table
```sql
CREATE TABLE timesheet_entries (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  client_file_number VARCHAR(100),
  department VARCHAR(100) NOT NULL,
  task VARCHAR(255) NOT NULL,
  activity TEXT,
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  start_time TIME,
  end_time TIME,
  total_hours DECIMAL(5,2),
  status ENUM('Pending', 'In Progress', 'Completed', 'Closed') DEFAULT 'Pending',
  billable BOOLEAN DEFAULT FALSE,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 👤 Default Users Created

The setup scripts will create these default users:

### Admin User
- **Email**: `admin@aja.com`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Department**: `Management`

### Supervisor User
- **Email**: `supervisor@aja.com`
- **Password**: `admin123`
- **Role**: `SUPERVISOR`
- **Department**: `Legal`

### Staff User
- **Email**: `staff@aja.com`
- **Password**: `admin123`
- **Role**: `STAFF`
- **Department**: `Legal`

## 🔍 Troubleshooting

### Common Issues:

#### 1. Database Connection Error
```bash
Error: Access denied for user 'khumocob_aja'@'localhost'
```
**Solution**:
- Verify database user exists
- Check password is correct
- Ensure user has proper permissions

#### 2. Database Doesn't Exist
```bash
Error: Unknown database 'khumocob_aja'
```
**Solution**:
- Create database in cPanel
- Run `node setup.js` to create database

#### 3. Tables Already Exist
```bash
Error: Table 'users' already exists
```
**Solution**:
- This is normal, the script handles existing tables
- Check if data was inserted correctly

#### 4. Permission Denied
```bash
Error: ER_ACCESS_DENIED_ERROR
```
**Solution**:
- Check database user permissions
- Verify database credentials in `.env`

## 📋 Verification Checklist

- [ ] Database `khumocob_aja` created
- [ ] User `khumocob_aja` created with proper permissions
- [ ] `.env` file configured correctly
- [ ] Dependencies installed (`npm install`)
- [ ] Database setup completed (`node setup.js`)
- [ ] Tables created (`node create-tables.js`)
- [ ] Default users created
- [ ] API endpoints responding
- [ ] Login functionality working

## 🚀 Start the Application

After database setup is complete:

```bash
# Start the backend server
node server.js

# Or use PM2 for production
pm2 start server.js --name "aja-timesheet"
```

## 📞 Support Commands

### Useful Database Commands:
```bash
# Check database connection
mysql -u khumocob_aja -p khumocob_aja

# List all tables
SHOW TABLES;

# Check users table
SELECT * FROM users;

# Check timesheet entries
SELECT * FROM timesheet_entries;
```

### Application Commands:
```bash
# Check if Node.js is running
ps aux | grep node

# Restart application
pkill node && node server.js

# Check application logs
tail -f logs/application.log
```

Your database should now be set up and ready to use! 🎉 