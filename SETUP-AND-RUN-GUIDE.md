# Setup and Run Guide
## Enhanced Fingerprint Attendance System

**Version**: 2.0 (Enterprise Security Edition)
**Last Updated**: January 2025

---

## 🚀 QUICK START (For Experienced Developers)

```bash
# 1. Install dependencies
npm run install-all

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 3. Set up database
cd backend && npm run setup-db

# 4. Start the application
npm run dev

# Access the application at http://localhost:8080
```

---

## 📋 PREREQUISITES

### System Requirements
- **Node.js**: 18.x or higher
- **MySQL**: 8.0 or higher
- **npm**: 9.x or higher
- **DigitalPersona U.areU SDK**: For fingerprint functionality
- **Git**: For version control

### Required Software
1. **Node.js & npm**: [Download Node.js](https://nodejs.org/)
2. **MySQL Server**: [Download MySQL](https://www.mysql.com/)
3. **MySQL Workbench**: (Optional) For database management
4. **VS Code**: (Recommended) [Download VS Code](https://code.visualstudio.com/)

### Hardware Requirements
- **Fingerprint Scanner**: DigitalPersona U.areU 4500 or compatible
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: Minimum 10GB free space
- **USB Port**: For fingerprint scanner connection

---

## 🔧 DETAILED SETUP PROCESS

### Step 1: Clone and Prepare the Repository

```bash
# Navigate to your project directory
cd C:\Users\boris\Documents\zen\NEW FP\_SAMPLE\fingerprint-attendance-vue

# Verify project structure
dir
```

Your project should have this structure:
```
fingerprint-attendance-vue/
├── backend/                 # Secure Express.js backend
├── client/                  # Vue.js frontend
├── package.json            # Root package configuration
├── .env.example           # Environment template
├── SETUP-AND-RUN-GUIDE.md # This file
└── SECURITY-IMPLEMENTATION-SUMMARY.md
```

### Step 2: Install Dependencies

```bash
# Install root dependencies and all client dependencies
npm run install-all

# Alternatively, install manually:
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Return to root directory
cd ..
```

### Step 3: Database Setup

#### 3.1 Create MySQL Database
```sql
-- Open MySQL Workbench or MySQL Command Line
CREATE DATABASE bc_zen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database user (optional but recommended)
CREATE USER 'attendance_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON bc_zen.* TO 'attendance_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3.2 Configure Environment Variables
```bash
# Copy environment template
copy .env.example .env

# Edit the .env file with your configuration
notepad .env
```

**Environment Variables (.env):**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bc_zen
DB_USER=attendance_user
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_at_least_32_characters_long
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:8080

# Biometric Configuration
BIOMETRIC_THRESHOLD=80
BIOMETRIC_MAX_ATTEMPTS=3
BIOMETRIC_TIMEOUT=30000

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=1800000
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/
```

### Step 4: Database Migration and Setup

```bash
# Navigate to backend directory
cd backend

# Run database setup
npm run setup-db

# This will:
# 1. Create all necessary tables
# 2. Insert default admin user
# 3. Set up indexes and constraints
# 4. Populate initial data

# Return to root directory
cd ..
```

**Manual Database Setup (if script fails):**
```bash
cd backend

# Start MySQL and import the setup file
mysql -u root -p bc_zen < setup.sql

# Or use MySQL Workbench to import setup.sql
```

### Step 5: DigitalPersona SDK Setup

#### 5.1 Download and Install SDK
1. Download DigitalPersona U.areU SDK from [HID Global](https://www.hidglobal.com/)
2. Install the SDK on your system
3. Copy SDK files to the frontend public directory

```bash
# Copy SDK files to client/public/js/
# You should have:
# - client/public/js/fingerprint.sdk.min.js
# - client/public/js/websdk.client.bundle.min.js
```

#### 5.2 Verify SDK Installation
```bash
# Check if SDK files exist
dir client\public\js\

# You should see the fingerprint SDK files
```

### Step 6: Start the Application

#### Development Mode
```bash
# Start both backend and frontend
npm run dev

# This will:
# 1. Start backend server on http://localhost:3000
# 2. Start frontend dev server on http://localhost:8080
# 3. Open browser automatically
```

#### Individual Services
```bash
# Start backend only
npm run server

# Start frontend only (in another terminal)
npm run client
```

### Step 7: Access the Application

1. **Frontend Application**: http://localhost:8080
2. **Backend API**: http://localhost:3000/api
3. **Default Admin Login**:
   - **URL**: http://localhost:8080/auth/login
   - **Username**: `admin`
   - **Password**: `admin123` (Change immediately!)

---

## 🔍 VERIFICATION AND TESTING

### Step 1: Verify Backend API
```bash
# Test backend health
curl http://localhost:3000/api/test-connection

# Expected response:
# {"success": true, "message": "Database connection successful"}
```

### Step 2: Verify Frontend
1. Open browser to http://localhost:8080
2. You should see the login page
3. Login with default admin credentials
4. Verify dashboard loads correctly

### Step 3: Test Fingerprint Scanner
1. Connect DigitalPersona U.areU 4500 scanner
2. Navigate to Biometrics section
3. Test fingerprint enrollment
4. Test attendance verification

### Step 4: Test Security Features
1. Try to access protected routes without logging in
2. Test role-based access control
3. Verify session timeout functionality
4. Test account lockout (5 failed attempts)

---

## 🏗️ BUILD FOR PRODUCTION

### Step 1: Build Frontend
```bash
# Build Vue.js frontend for production
npm run build

# This creates optimized files in client/dist/
```

### Step 2: Production Deployment
```bash
# Start production server
npm start

# Or using PM2 for process management:
pm2 start ecosystem.config.js
```

### Step 3: Production Configuration
Update `.env` for production:
```env
NODE_ENV=production
PORT=80
FRONTEND_URL=https://your-domain.com
```

---

## 🔧 TROUBLESHOOTING

### Common Issues and Solutions

#### Issue 1: Port Already in Use
```bash
# Error: Port 3000 already in use
# Solution:
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

#### Issue 2: Database Connection Failed
```bash
# Error: ECONNREFUSED connection to database
# Solutions:
# 1. Check MySQL service is running
# 2. Verify database credentials in .env
# 3. Check database exists: CREATE DATABASE bc_zen;
# 4. Verify user has proper privileges
```

#### Issue 3: Fingerprint SDK Not Loading
```bash
# Error: Fingerprint SDK not loaded
# Solutions:
# 1. Verify SDK files in client/public/js/
# 2. Check browser console for SDK loading errors
# 3. Ensure scanner drivers are installed
# 4. Test scanner with manufacturer's software
```

#### Issue 4: CORS Errors
```bash
# Error: CORS policy error
# Solutions:
# 1. Check FRONTEND_URL in .env matches your frontend URL
# 2. Verify CORS configuration in backend server.js
# 3. Ensure no ad-blockers are interfering
```

#### Issue 5: Vue.js Build Errors
```bash
# Error: Build failed with errors
# Solutions:
# 1. Clear node_modules and reinstall:
rm -rf node_modules package-lock.json
npm install

# 2. Check for syntax errors in Vue components
# 3. Verify all imports are correct
```

---

## 📱 MOBILE AND TABLET SETUP

### Chrome Mobile Debugging
1. Connect mobile device via USB
2. Enable USB debugging in developer options
3. Open Chrome on desktop
4. Navigate to `chrome://inspect`
5. Select your device for remote debugging

### Responsive Testing
1. Open browser developer tools (F12)
2. Toggle device mode (Ctrl+Shift+M)
3. Test different screen sizes
4. Verify fingerprint functionality on touch devices

---

## 🔒 SECURITY CONFIGURATION

### Production Security Checklist
- [ ] Change default admin password
- [ ] Generate secure JWT secret
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enable database security
- [ ] Configure backup procedures
- [ ] Set up monitoring and alerting
- [ ] Review access control policies

### SSL/HTTPS Setup
```bash
# For production, configure HTTPS:
# 1. Obtain SSL certificate (Let's Encrypt recommended)
# 2. Update server configuration for HTTPS
# 3. Redirect HTTP to HTTPS
# 4. Update frontend API calls to use HTTPS
```

---

## 📊 MONITORING AND LOGGING

### Application Logs
```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log

# View security logs
tail -f logs/security.log
```

### Performance Monitoring
```bash
# Check memory usage
npm run monitor:memory

# Check API response times
npm run monitor:performance

# Health check endpoint
curl http://localhost:3000/api/health
```

---

## 🔄 UPDATES AND MAINTENANCE

### Regular Maintenance Tasks
1. **Weekly**: Check logs for errors and security events
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Security audit and penetration testing
4. **Annually**: Review and update security policies

### Updating Dependencies
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Audit security vulnerabilities
npm audit fix
```

### Database Maintenance
```bash
# Backup database
mysqldump -u root -p bc_zen > backup_$(date +%Y%m%d).sql

# Optimize database
npm run db:optimize

# Clean old logs
npm run logs:clean
```

---

## 🚨 EMERGENCY PROCEDURES

### System Recovery
1. **Database Recovery**: Restore from latest backup
2. **Application Recovery**: Restart services using PM2
3. **Security Incident**: Review logs and notify security team

### Contact Information
- **Technical Support**: support@yourcompany.com
- **Security Team**: security@yourcompany.com
- **Emergency Line**: +1-XXX-XXX-XXXX

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- [API Documentation](./docs/API.md)
- [Security Guide](./docs/SECURITY.md)
- [User Manual](./docs/USER_MANUAL.md)

### Support
- [GitHub Issues](https://github.com/your-repo/issues)
- [Community Forum](https://forum.yourcompany.com)
- [Knowledge Base](https://kb.yourcompany.com)

---

## ✅ SUCCESS CRITERIA

Your application is running successfully when:

1. ✅ Backend API responds at http://localhost:3000/api
2. ✅ Frontend loads at http://localhost:8080
3. ✅ Database connection is successful
4. ✅ Admin login works with default credentials
5. ✅ Dashboard loads with correct data
6. ✅ Fingerprint scanner is detected and functional
7. ✅ Security features are working (auth, roles, permissions)

---

**Need Help?** Check the troubleshooting section or refer to the additional documentation resources.

**Good Luck!** 🚀