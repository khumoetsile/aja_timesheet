# 🚀 AJA Timesheet - cPanel Deployment Guide

## 📋 Prerequisites
- cPanel hosting account with Node.js support
- MySQL database access
- File Manager access
- Terminal/SSH access (recommended)

## 🗂️ File Structure for cPanel

```
public_html/
├── index.html (Angular frontend)
├── assets/
├── *.js files (Angular bundles)
├── *.css files
├── favicon.ico
└── backend/
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

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Files

#### Frontend (Angular)
The Angular build is already complete in `dist/timesheet-app/`. You need to upload these files to `public_html/`.

#### Backend (Node.js)
All backend files are in the `backend/` folder and ready for upload.

### Step 2: Database Setup in cPanel

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

### Step 3: Upload Files via cPanel File Manager

#### Upload Frontend:
1. **Navigate to `public_html/`**
2. **Upload all files from `dist/timesheet-app/`** to the root of `public_html/`
3. **Files to upload**:
   - `index.html`
   - `favicon.ico`
   - `styles.fa3d0939ea8f4be5.css`
   - All `.js` files
   - `assets/` folder (if any)

#### Upload Backend:
1. **Create folder**: `public_html/backend/`
2. **Upload all files from `backend/`** to `public_html/backend/`
3. **Important files**:
   - `server.js`
   - `package.json`
   - `.env`
   - `routes/` folder
   - `middleware/` folder
   - `config/` folder
   - `database/` folder

### Step 4: Configure Environment Variables

#### Update Backend .env File:
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

### Step 5: Install Dependencies and Start Backend

#### Option A: Using cPanel Terminal
1. **Open Terminal** in cPanel
2. **Navigate to backend**:
   ```bash
   cd public_html/backend
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up database**:
   ```bash
   node setup.js
   node create-tables.js
   ```
5. **Start the application**:
   ```bash
   node server.js
   ```

#### Option B: Using SSH (if available)
```bash
ssh yourdomain.com
cd public_html/backend
npm install
node setup.js
node create-tables.js
node server.js
```

### Step 6: Configure Domain and Subdomain

#### Option A: Main Domain
- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com/backend`

#### Option B: Subdomain
- Frontend: `https://aja.yourdomain.com`
- Backend: `https://api.yourdomain.com`

### Step 7: Update Frontend API URLs

If you're using a subdomain setup, update the API URLs in the frontend files:

#### Update these files in `public_html/`:
- `main.454868c51619be99.js` (contains API URLs)
- Or rebuild Angular with correct URLs

## 🔧 Configuration for Different Hosting Scenarios

### Scenario 1: Shared Hosting with Node.js Support
- Use the setup above
- Backend runs on port 3000
- Frontend serves from `public_html/`

### Scenario 2: VPS/Dedicated Hosting
- Install Node.js on server
- Use PM2 for process management
- Set up reverse proxy (nginx/Apache)

### Scenario 3: cPanel with Node.js App Manager
1. **Go to Node.js App Manager** in cPanel
2. **Create new application**:
   - App name: `aja-timesheet`
   - App root: `public_html/backend`
   - App URL: `yourdomain.com/backend`
   - Node.js version: 18.x
   - Environment variables: Add from `.env` file
3. **Start the application**

## 🔍 Testing Your Deployment

### Test Backend:
```bash
curl https://yourdomain.com/backend/health
```
Expected response:
```json
{
  "status": "OK",
  "message": "AJA Timesheet API is running",
  "timestamp": "2024-08-04T14:25:12.636Z"
}
```

### Test Frontend:
1. **Visit**: `https://yourdomain.com`
2. **Login with**:
   - Admin: `admin@aja.com` / `admin123`
   - Supervisor: `supervisor@aja.com` / `admin123`
   - Staff: `staff@aja.com` / `admin123`

## 🚨 Troubleshooting

### Common Issues:

#### 1. Database Connection Error
- Check database credentials in `.env`
- Verify database user has proper permissions
- Test connection manually

#### 2. Port Issues
- Some hosts don't allow custom ports
- Use port 3000 or check with your host
- Consider using reverse proxy

#### 3. CORS Errors
- Update `FRONTEND_URL` in backend `.env`
- Check browser console for CORS errors

#### 4. File Permissions
- Set proper permissions: `755` for folders, `644` for files
- Ensure `.env` file is readable

#### 5. Node.js Not Starting
- Check error logs in cPanel
- Verify Node.js version compatibility
- Check if all dependencies are installed

### Debugging Steps:
1. **Check cPanel error logs**
2. **Test database connection**
3. **Verify file permissions**
4. **Check Node.js application logs**
5. **Test API endpoints manually**

## 📞 Support Commands

### Useful cPanel Commands:
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List running processes
ps aux | grep node

# Check application logs
tail -f ~/logs/application.log

# Restart application
pkill node && node server.js
```

## 🎯 Final Checklist

- [ ] Database created and configured
- [ ] Backend files uploaded to `public_html/backend/`
- [ ] Frontend files uploaded to `public_html/`
- [ ] `.env` file configured with correct database credentials
- [ ] Dependencies installed (`npm install`)
- [ ] Database tables created (`node setup.js` and `node create-tables.js`)
- [ ] Backend application started (`node server.js`)
- [ ] Frontend accessible at `https://yourdomain.com`
- [ ] Backend API accessible at `https://yourdomain.com/backend/health`
- [ ] Login functionality working
- [ ] All features tested

## 🚀 Go Live!

Once everything is working:
1. **Test all user roles** (Admin, Supervisor, Staff)
2. **Create sample timesheet entries**
3. **Test all dashboard features**
4. **Monitor application logs**
5. **Set up regular backups**

Your AJA Timesheet application is now live! 🎉 