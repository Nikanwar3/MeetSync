# MeetSync - Video Conferencing Platform

A full-featured Zoom clone supporting  participants with WebRTC, Socket.IO, and JWT authentication.

## Features

- 🎥 **Video & Audio Conferencing** - HD video calls with multiple participants
- 👥 **Participant Support** - Scalable architecture using WebRTC mesh
- 🔐 **Authentication** - JWT-based secure login/register system
- 🚪 **Guest Access** - Join meetings with just a code (no account needed)
- 💬 **Real-time Chat** - In-meeting text chat
- 🖥️ **Screen Sharing** - Share your screen with participants
- 🎤 **Audio/Video Controls** - Mute/unmute, turn camera on/off
- 📋 **Meeting Codes** - Share simple meeting codes
- 🔒 **Meeting Passcodes** - Optional password protection
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

### Backend
- **Node.js** & **Express** - Server framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - Database for users and meetings
- **Mongoose** - MongoDB object modeling
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Socket.IO Client** - Real-time communication
- **WebRTC** - Peer-to-peer video/audio
- **Axios** - HTTP client

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm**  - Comes with Node.js

## Installation & Setup

### 1. Clone or Download the Project

```bash
cd meetsync
```

### 2. Install MongoDB (if not already installed)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Linux:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### 3. Install Server Dependencies

```bash
cd server
npm install
```

### 4. Install Client Dependencies

```bash
cd ../client
npm install
```

### 5. Configure Environment Variables

**Server (.env file is already created)**
The server/.env file contains:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/meetsync
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Client (.env file is already created)**
The client/.env file contains:
```
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

⚠️ **Important**: Change the JWT_SECRET in production!

## Running the Application

### Option 1: Run Separately (Development)

**Terminal 1 - Start MongoDB (if not running as service):**
```bash
mongod
```

**Terminal 2 - Start the Server:**
```bash
cd server
npm start
```
Server will run on http://localhost:5000

**Terminal 3 - Start the Client:**
```bash
cd client
npm start
```
Client will run on http://localhost:3000

### Option 2: Use Nodemon for Development (Optional)

Install nodemon globally:
```bash
npm install -g nodemon
```

Then run the server with:
```bash
cd server
npm run dev
```

## Usage

### Creating an Account
1. Go to http://localhost:3000
2. Click "Sign In"
3. Click "Sign Up" to create an account
4. Fill in username, email, and password
5. Click "Sign Up"

### Starting a Meeting
1. Log in to your account
2. Click "New Meeting" on the home page
3. Share the meeting code or link with participants

### Joining a Meeting
**With Account:**
1. Log in
2. Enter the meeting code
3. Click "Join"

**As Guest:**
1. Go to http://localhost:3000
2. Enter meeting code in "Join a Meeting"
3. Enter your name (optional)
4. Click "Join"

### In-Meeting Controls
- 🎤 **Microphone** - Toggle audio on/off
- 📹 **Camera** - Toggle video on/off
- 🖥️ **Screen Share** - Share your screen
- 💬 **Chat** - Open/close chat panel
- 📞 **Leave** - Exit the meeting

## Project Structure

```
meetsync/
├── server/
│   ├── models/
│   │   ├── User.js          # User schema
│   │   └── Meeting.js       # Meeting schema
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   └── meetings.js      # Meeting routes
│   ├── middleware/
│   │   └── auth.js          # JWT auth middleware
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env
│
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js      # Landing page
│   │   │   ├── Home.css
│   │   │   ├── VideoRoom.js # Meeting room
│   │   │   └── VideoRoom.css
│   │   ├── utils/
│   │   │   ├── api.js       # API configuration
│   │   │   └── peerConnection.js # WebRTC logic
│   │   ├── App.js           # Main app component
│   │   ├── index.js         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── .env
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Meetings
- `POST /api/meetings/create` - Create new meeting (requires auth)
- `GET /api/meetings/:meetingId` - Get meeting details
- `POST /api/meetings/:meetingId/validate` - Validate passcode
- `GET /api/meetings/user/meetings` - Get user's meetings (requires auth)

## Socket.IO Events

### Client → Server
- `join-room` - Join a meeting room
- `leave-room` - Leave a meeting room
- `offer` - Send WebRTC offer
- `answer` - Send WebRTC answer
- `ice-candidate` - Send ICE candidate
- `toggle-audio` - Toggle microphone
- `toggle-video` - Toggle camera
- `chat-message` - Send chat message
- `start-screen-share` - Start screen sharing
- `stop-screen-share` - Stop screen sharing

### Server → Client
- `existing-users` - List of users already in room
- `user-joined` - New user joined
- `user-left` - User left the room
- `offer` - Receive WebRTC offer
- `answer` - Receive WebRTC answer
- `ice-candidate` - Receive ICE candidate
- `user-audio-toggled` - User muted/unmuted
- `user-video-toggled` - User camera on/off
- `chat-message` - Receive chat message
- `user-started-screen-share` - User started sharing
- `user-stopped-screen-share` - User stopped sharing



The current implementation uses WebRTC mesh topolog:

### 1. SFU (Selective Forwarding Unit)
Implement a media server like:
- **Mediasoup** - High-performance SFU
- **Janus** - WebRTC server
- **Kurento** - Media server

### 2. Turn Servers
Add TURN servers for better connectivity:
```javascript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    }
  ]
};
```

### 3. Load Balancing
Use Redis for Socket.IO scaling:
```bash
npm install redis @socket.io/redis-adapter
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# macOS
brew services start mongodb-community

```

### Camera/Microphone Access Denied
**Solution**: 
- Allow camera/microphone permissions in browser
- Use HTTPS in production (HTTP only works on localhost)

### WebRTC Connection Failed
**Solution**:
- Check firewall settings
- Configure TURN servers for production
- Ensure ports are open

### CORS Errors
**Solution**: Verify CLIENT_URL in server/.env matches your client URL

## Production Deployment

### Backend (Server)
1. Use a production MongoDB instance (MongoDB Atlas, etc.)
2. Set NODE_ENV=production
3. Change JWT_SECRET to a secure random string
4. Use a process manager (PM2)
5. Set up SSL/TLS certificates
6. Configure TURN servers

### Frontend (Client)
1. Build the React app: `npm run build`
2. Serve static files with nginx/Apache
3. Update .env with production URLs
4. Enable HTTPS

### Recommended Platforms
- **Heroku** - Easy deployment
- **DigitalOcean** - Droplets or App Platform
- **AWS** - EC2, Elastic Beanstalk
- **Vercel** - Frontend hosting
- **Railway** - Full-stack deployment

## Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Performance Optimization

- Implement adaptive bitrate for video
- Use codec negotiation (VP8/VP9/H.264)
- Add network quality indicators
- Implement simulcast for better quality
- Use WebAssembly for media processing

## Security Considerations

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection

## Future Enhancements

- [ ] Recording functionality
- [ ] Virtual backgrounds
- [ ] Breakout rooms
- [ ] Polls and reactions
- [ ] Hand raise feature
- [ ] Waiting room
- [ ] Co-host capabilities
- [ ] Calendar integration
- [ ] Mobile apps (React Native)
- [ ] AI-powered noise cancellation

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions:
1. Check this README
2. Review the code comments
3. Check browser console for errors
4. Verify all services are running

## Credits

Built with ❤️ using modern web technologies.

---

**Happy Meeting! 🎉**
