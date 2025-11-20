# Quick Start Commands
## Enhanced Fingerprint Attendance System

**🚀 Get your application running in minutes with these commands**

---

## 📋 INITIAL SETUP (One-time only)

### 1. Install All Dependencies
```bash
# Install root and client dependencies
npm run install-all

# Manual installation (if script fails)
npm install
cd client
npm install
cd ..
```

### 2. Environment Configuration
```bash
# Create environment file
copy .env.example .env

# Edit configuration (use VS Code or Notepad)
code .env
# or
notepad .env
```

### 3. Database Setup
```bash
# Navigate to backend and run setup
cd backend
npm run setup-db
cd ..

# Manual database setup
mysql -u root -p bc_zen < backend/setup.sql
```

---

## 🚀 RUNNING THE APPLICATION

### Development Mode (Recommended for testing)
```bash
# Start both backend and frontend
npm run dev

# This starts:
# - Backend: http://localhost:3000
# - Frontend: http://localhost:8080
# - Opens browser automatically
```

### Individual Services
```bash
# Start backend only
npm run server

# Start frontend only (in separate terminal)
npm run client

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔧 TROUBLESHOOTING COMMANDS

### Port Issues
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill process using port 3000
taskkill /PID <PID_NUMBER> /F

# Alternative: Use different port
set PORT=3001 && npm run server
```

### Database Issues
```bash
# Test database connection
curl http://localhost:3000/api/test-connection

# Reset database
cd backend
mysql -u root -p bc_zen < setup.sql
cd ..
```

### Dependency Issues
```bash
# Clear and reinstall dependencies
rmdir /s node_modules
del package-lock.json
npm run install-all
```

---

## 📱 ACCESSING THE APPLICATION

### URLs
- **Main Application**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
- **Legacy Routes**: http://localhost:8080/legacy/ (for backward compatibility)

### Default Login
- **URL**: http://localhost:8080/auth/login
- **Username**: `admin`
- **Password**: `admin123`
- **⚠️ Change immediately after first login!**

---

## 🔍 VERIFICATION COMMANDS

### Backend Health Check
```bash
# Test API health
curl http://localhost:3000/api/health

# Test database connection
curl http://localhost:3000/api/test-connection

# Check database contents
curl http://localhost:3000/api/test-contents
```

### Frontend Verification
```bash
# Check if frontend is running
curl http://localhost:8080

# Should return Vue.js application HTML
```

### Fingerprint Scanner Test
```bash
# Verify SDK files exist
dir client\public\js\

# Should show:
# - fingerprint.sdk.min.js
# - websdk.client.bundle.min.js
```

---

## 🛠️ DEVELOPMENT COMMANDS

### Frontend Development
```bash
cd client

# Start development server
npm run serve

# Build for production
npm run build

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Backend Development
```bash
cd backend

# Start with nodemon (auto-restart on changes)
nodemon server.js

# Start normally
node server.js

# Debug mode
node --inspect server.js
```

---

## 🔒 SECURITY COMMANDS

### Test Authentication
```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Rate Limiting
```bash
# Simulate multiple failed login attempts
for /L %i in (1,1,10) do (
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"wrong","password":"wrong"}'
)
```

---

## 📊 MONITORING COMMANDS

### Check Application Status
```bash
# Check if processes are running
tasklist | findstr node

# Check port usage
netstat -an | findstr :3000
netstat -an | findstr :8080
```

### View Logs (if implemented)
```bash
# View application logs
type logs\app.log

# View error logs
type logs\error.log

# Real-time log monitoring
tail -f logs\app.log
```

---

## 🔄 RESET COMMANDS

### Complete Reset (Use with caution!)
```bash
# Stop all running processes
taskkill /F /IM node.exe

# Remove all node_modules
rmdir /s /q node_modules
rmdir /s /q client\node_modules

# Clear package locks
del package-lock.json
del client\package-lock.json

# Reinstall everything
npm run install-all
```

### Database Reset
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS bc_zen; CREATE DATABASE bc_zen;"

# Import fresh schema
mysql -u root -p bc_zen < backend/setup.sql
```

---

## 🎯 QUICK TEST SEQUENCE

### 1. Basic Functionality Test
```bash
# 1. Start application
npm run dev

# 2. Open browser to http://localhost:8080
# 3. Login with admin/admin123
# 4. Verify dashboard loads
# 5. Test navigation between modules
```

### 2. API Test Sequence
```bash
# Test connection
curl http://localhost:3000/api/test-connection

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test protected endpoint (use token from login)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/employees/search
```

### 3. Security Test Sequence
```bash
# Test unauthenticated access
curl http://localhost:3000/api/employees

# Should return 401 Unauthorized

# Test rate limiting
# Run multiple failed login attempts quickly
# Should get locked out after 5 attempts
```

---

## 🚨 EMERGENCY COMMANDS

### Stop Application Immediately
```bash
# Kill all Node.js processes
taskkill /F /IM node.exe

# Or stop specific ports
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Emergency Backup
```bash
# Quick backup
mysqldump -u root -p bc_zen > emergency_backup.sql

# Quick restore
mysql -u root -p bc_zen < emergency_backup.sql
```

---

## 📱 MOBILE TESTING

### Chrome Mobile Debugging
```bash
# 1. Connect Android device via USB
# 2. Enable USB debugging in developer options
# 3. Open Chrome on desktop
# 4. Navigate to chrome://inspect
# 5. Select your device for debugging
```

---

## ⚡ PERFORMANCE COMMANDS

### Check Application Performance
```bash
# Check memory usage
node --max-old-space-size=4096 server.js

# Monitor Node.js process
tasklist | findstr node.exe

# Check response times
curl -w "Time: %{time_total}s\n" -o /dev/null -s http://localhost:3000/api/health
```

---

## ✅ SUCCESS CHECKLIST

After running these commands, your application should:

- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:8080
- [ ] Database connection successful
- [ ] Admin login working (admin/admin123)
- [ ] Dashboard loading correctly
- [ ] Security features functional
- [ ] Fingerprint SDK loaded (if scanner connected)

### If any item fails:
1. Check the corresponding troubleshooting section
2. Review console error messages
3. Verify configuration files
4. Check database connection

---

## 🆘 GETTING HELP

### Common Issues Resolution
1. **Port conflicts**: Use different ports or kill conflicting processes
2. **Database errors**: Verify MySQL service and credentials
3. **SDK issues**: Check fingerprint scanner connection and drivers
4. **Build errors**: Clear node_modules and reinstall

### Support Resources
- **Documentation**: See `SETUP-AND-RUN-GUIDE.md`
- **Security Guide**: See `SECURITY-IMPLEMENTATION-SUMMARY.md`
- **Error Logs**: Check browser console and terminal output

---

**🎉 Happy coding! Your secure fingerprint attendance system is ready to use!**