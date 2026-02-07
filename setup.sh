#!/bin/bash

echo "🚀 MeetSync Setup Script"
echo "========================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found in PATH. Make sure MongoDB is installed and running."
    echo "   Download from: https://www.mongodb.com/try/download/community"
else
    echo "✅ MongoDB found"
fi

echo ""
echo "📦 Installing server dependencies..."
cd server
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

echo ""
echo "📦 Installing client dependencies..."
cd ../client
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Make sure MongoDB is running"
echo "   2. Open a terminal and run: cd server && npm start"
echo "   3. Open another terminal and run: cd client && npm start"
echo "   4. Visit http://localhost:3000 in your browser"
echo ""
echo "📖 For detailed instructions, see README.md"
