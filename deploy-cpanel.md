# AJA Timesheet - cPanel Deployment Guide

## 📋 Prerequisites
- cPanel hosting account with Node.js support
- MySQL database access
- File Manager access

## 🗂️ File Structure for cPanel

### Backend (Node.js)
```
public_html/backend/
├── node_modules/
├── routes/
├── middleware/
├── config/
├── database/
├── .env
├── package.json
├── server.js
└── other backend files
```

### Frontend (Angular)
```
public_html/
├── index.html
├── assets/
├── styles.css
└── other Angular build files
```

## 🚀 Deployment Steps

### Step 1: Build Angular Frontend
```bash
# In your local project
npm run build
```

### Step 2: Upload Backend to cPanel
1. **Create backend folder**: `public_html/backend/`
2. **Upload backend files** to this folder
3. **Set up .env file** with your database credentials

### Step 3: Upload Frontend to cPanel
1. **Upload Angular build files** to `public_html/`
2. **Update API URLs** to point to your backend

### Step 4: Configure Database
1. **Create MySQL database**: `khumocob_aja`
2. **Create database user**: `khumocob_aja`
3. **Set up database tables**

### Step 5: Start Node.js Application
1. **Access Terminal** in cPanel
2. **Navigate to backend folder**
3. **Install dependencies**: `npm install`
4. **Start application**: `node server.js`

## 🔧 Configuration Files

### Backend .env File
```env
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=khumocob_aja
DB_USER=khumocob_aja
DB_PASSWORD=khumocob_aja
JWT_SECRET=aja-timesheet-super-secret-jwt-key-2024
FRONTEND_URL=https://yourdomain.com
```

### Frontend API Configuration
Update all API URLs to point to your backend:
- `https://yourdomain.com/backend/api`

## 📝 Detailed Steps

### 1. Build Angular Application
```bash
ng build --configuration production
```

### 2. Prepare Backend for Upload
- Copy all backend files to a folder
- Include the `.env` file with correct database settings
- Make sure `package.json` is included

### 3. Upload via cPanel File Manager
- Navigate to `public_html/`
- Create `backend/` folder
- Upload backend files to `backend/` folder
- Upload Angular build files to root of `public_html/`

### 4. Database Setup
- Go to MySQL Databases in cPanel
- Create database: `khumocob_aja`
- Create user: `khumocob_aja`
- Assign user to database with all privileges
- Run database setup scripts

### 5. Start Node.js Application
- Use cPanel Terminal or SSH
- Navigate to `public_html/backend/`
- Run: `npm install`
- Run: `node server.js`

## 🔍 Troubleshooting

### Common Issues:
1. **Port Issues**: Some hosts don't allow custom ports
2. **Database Connection**: Check credentials and permissions
3. **CORS Issues**: Update frontend URL in backend config
4. **File Permissions**: Ensure proper file permissions

### Testing:
- Backend: `https://yourdomain.com/backend/health`
- Frontend: `https://yourdomain.com`

## 📞 Support
If you encounter issues, check:
1. cPanel error logs
2. Node.js application logs
3. Database connection status
4. File permissions 