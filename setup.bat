@echo off
echo.
echo MeetSync Setup Script
echo =====================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version

where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MongoDB not found. Make sure MongoDB is installed and running.
    echo           Download from: https://www.mongodb.com/try/download/community
) else (
    echo [OK] MongoDB found
)

echo.
echo Installing server dependencies...
cd server
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo Installing client dependencies...
cd ..\client
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install client dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo [SUCCESS] Installation complete!
echo.
echo Next steps:
echo   1. Make sure MongoDB is running
echo   2. Open Command Prompt and run: cd server ^&^& npm start
echo   3. Open another Command Prompt and run: cd client ^&^& npm start
echo   4. Visit http://localhost:3000 in your browser
echo.
echo For detailed instructions, see README.md
echo.
pause
