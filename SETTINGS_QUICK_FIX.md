# 🔧 Quick Settings Fix

## The Issue
- Backend not starting properly (port conflicts)
- Database connection issues
- Settings API returning "Route not found"

## 🚀 Quick Solution

### Step 1: Create Database Table
Run this SQL in your MySQL database:

```sql
USE khumocob_aja;

CREATE TABLE IF NOT EXISTS user_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    theme ENUM('light', 'dark') DEFAULT 'dark',
    density ENUM('comfortable', 'compact') DEFAULT 'comfortable',
    start_time TIME DEFAULT '08:00:00',
    end_time TIME DEFAULT '17:00:00',
    remember_filters BOOLEAN DEFAULT true,
    weekly_reminder BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_settings (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Step 2: Fix Backend
1. **Kill all Node processes:**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **Start backend properly:**
   ```powershell
   cd backend
   $env:PORT=3000
   npm run dev
   ```

3. **Test backend:**
   ```powershell
   curl http://localhost:3000/health
   ```

### Step 3: Start Frontend
```powershell
cd ..
ng serve
```

## 💡 Alternative: Temporary localStorage Fix

If backend issues persist, I can create a temporary localStorage version that works immediately while you fix the backend.

## ✅ Expected Result

Once working:
- Settings page loads without errors
- Theme switching works instantly  
- Form saves successfully
- Reset button works
- No more "Route not found" errors

## 🔍 Debug Steps

1. **Check backend logs:**
   - Look for database connection errors
   - Verify port 3000 is free
   - Check if settings route is registered

2. **Test API directly:**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT" http://localhost:3000/api/settings
   ```

3. **Verify database:**
   - Check if `user_settings` table exists
   - Verify user_id foreign key references work

Let me know if you need the temporary localStorage version while fixing the backend!


