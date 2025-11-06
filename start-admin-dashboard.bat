@echo off
echo =====================================
echo   ADMIN DASHBOARD STARTUP SCRIPT
echo =====================================
echo.

echo 🔧 Starting backend server...
cd backend
start "Backend Server" cmd /k "node server.js"

echo ⏳ Waiting 3 seconds for server to start...
timeout /t 3 /nobreak >nul

echo 🌐 Opening admin dashboard...
cd ..
start "" "working-admin-dashboard.html"

echo.
echo ✅ SETUP COMPLETE!
echo.
echo 📋 What's available:
echo   - Backend server running on http://localhost:5000
echo   - Admin dashboard opened in your browser
echo   - 3 pending registrations ready for approval
echo.
echo 🔑 Admin Credentials:
echo   Email: admin@college-finder.com
echo   Password: admin123
echo.
echo 👥 Pending Users to Approve:
echo   1. Kongunadu College of Engineering and Technology (kncet@gmail.com)
echo   2. kn (kn@gmail.com) 
echo   3. admin (admin@gmail.com)
echo.
echo Press any key to exit this script...
pause >nul