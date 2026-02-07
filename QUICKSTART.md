# MeetSync - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Prerequisites Check
Make sure you have installed:
- ✅ Node.js (v16+): https://nodejs.org/
- ✅ MongoDB: https://www.mongodb.com/try/download/community

Verify installation:
```bash
node --version    # Should show v16.x.x or higher
mongod --version  # Should show MongoDB version
```

### Step 2: Start MongoDB
Open a terminal and run:

**macOS/Linux:**
```bash
mongod
# Or if installed as service:
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
```

**Windows:**
```bash
# MongoDB should auto-start as a service
# Or manually run:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

### Step 3: Install Dependencies

**Option A - Automatic (Recommended):**
```bash
# macOS/Linux
./setup.sh

# Windows
setup.bat
```

**Option B - Manual:**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 4: Start the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm start
```
✅ Server runs on http://localhost:5000

**Terminal 2 - Start Client:**
```bash
cd client
npm start
```
✅ Client runs on http://localhost:3000

### Step 5: Use the Application

1. **Browser opens automatically** to http://localhost:3000

2. **Create an account:**
   - Click "Sign In"
   - Click "Sign Up"
   - Fill in: username, email, password
   - Click "Sign Up"

3. **Start a meeting:**
   - Click "New Meeting"
   - Share the meeting code with others

4. **Join as guest (no account needed):**
   - Enter meeting code
   - Enter your name (optional)
   - Click "Join"

## 🎮 Controls in Meeting

| Button | Function |
|--------|----------|
| 🎤 | Mute/Unmute microphone |
| 📹 | Turn camera on/off |
| 🖥️ | Share screen |
| 💬 | Open chat panel |
| 📞 | Leave meeting |

## ✅ Test the Application

1. **Single Computer Test:**
   - Open http://localhost:3000 in Chrome
   - Create a meeting and note the code
   - Open http://localhost:3000 in Firefox (or Incognito Chrome)
   - Join with the meeting code as guest
   - You should see yourself in both windows!

2. **Multi-Computer Test:**
   - Start server on one computer
   - Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Update client/.env: `REACT_APP_API_URL=http://YOUR_IP:5000/api`
   - Other computers can join using http://YOUR_IP:3000

## 🐛 Common Issues

### "Cannot connect to MongoDB"
- Make sure MongoDB is running: `mongod`
- Check if port 27017 is available

### "Port 3000 already in use"
- Kill the process: `lsof -ti:3000 | xargs kill -9` (Mac/Linux)
- Or change port in client/package.json

### "Camera/Microphone not working"
- Allow permissions in browser
- Check browser settings
- HTTPS required in production (HTTP works on localhost)

### "Can't see other participants"
- Check firewall settings
- Ensure both users are in the same meeting room
- Check browser console for errors (F12)

## 📁 Project Structure
```
meetsync/
├── server/          → Backend (Node.js + Express)
├── client/          → Frontend (React)
├── README.md        → Full documentation
└── QUICKSTART.md    → This file
```

## 🔧 Development Tips

**Use nodemon for auto-restart:**
```bash
cd server
npm install -g nodemon
npm run dev
```

**View MongoDB data:**
```bash
# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use meetsync database
use meetsync

# Show collections
show collections

# View users
db.users.find()

# View meetings
db.meetings.find()
```

## 📊 System Requirements

**Minimum:**
- 2GB RAM
- 2 CPU cores
- 1GB disk space

**Recommended for 100+ users:**
- 8GB+ RAM
- 4+ CPU cores
- SSD storage
- Good internet (50+ Mbps)

## 🌐 Browser Requirements

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 80+ | ✅ Recommended |
| Firefox | 75+ | ✅ Supported |
| Safari | 14+ | ✅ Supported |
| Edge | 80+ | ✅ Supported |

## 🎯 Next Steps

1. ✅ Read full README.md for detailed features
2. ✅ Customize .env files for your setup
3. ✅ Test with multiple users
4. ✅ Deploy to production when ready

## 🆘 Need Help?

1. Check README.md for detailed documentation
2. Review server logs in terminal
3. Check browser console (F12 → Console)
4. Ensure all services are running

---

**You're all set! Start building amazing video experiences! 🎉**
