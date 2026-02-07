import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';
import PeerConnection from '../utils/peerConnection';
import './VideoRoom.css';

const SOCKET_SERVER = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function VideoRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  
  const [peers, setPeers] = useState({});
  const [localAudio, setLocalAudio] = useState(true);
  const [localVideo, setLocalVideo] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [userName, setUserName] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const guestName = searchParams.get('name');
    const name = storedUser.username || guestName || 'Guest';
    setUserName(name);

    initializeMedia(name);

    return () => {
      cleanup();
    };
  }, [roomId]);

  const initializeMedia = async (name) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsReady(true);
      connectToRoom(name, stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Failed to access camera/microphone. Please grant permissions.');
    }
  };

  const connectToRoom = (name, stream) => {
    socketRef.current = io(SOCKET_SERVER);

    socketRef.current.emit('join-room', {
      roomId,
      userName: name,
      userId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null
    });

    socketRef.current.on('existing-users', async (users) => {
      console.log('Existing users:', users);
      
      for (const user of users) {
        await createPeerConnection(user.socketId, true, stream);
      }
    });

    socketRef.current.on('user-joined', async ({ socketId, userName }) => {
      console.log('User joined:', userName, socketId);
      await createPeerConnection(socketId, false, stream);
    });

    socketRef.current.on('offer', async ({ offer, from }) => {
      console.log('Received offer from:', from);
      const peer = peersRef.current[from];
      if (peer) {
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        socketRef.current.emit('answer', { answer, to: from });
      }
    });

    socketRef.current.on('answer', async ({ answer, from }) => {
      console.log('Received answer from:', from);
      const peer = peersRef.current[from];
      if (peer) {
        await peer.setRemoteDescription(answer);
      }
    });

    socketRef.current.on('ice-candidate', async ({ candidate, from }) => {
      const peer = peersRef.current[from];
      if (peer) {
        await peer.addIceCandidate(candidate);
      }
    });

    socketRef.current.on('user-left', ({ socketId }) => {
      console.log('User left:', socketId);
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
        setPeers((prev) => {
          const newPeers = { ...prev };
          delete newPeers[socketId];
          return newPeers;
        });
      }
    });

    socketRef.current.on('user-audio-toggled', ({ socketId, audio }) => {
      setPeers((prev) => ({
        ...prev,
        [socketId]: { ...prev[socketId], audio }
      }));
    });

    socketRef.current.on('user-video-toggled', ({ socketId, video }) => {
      setPeers((prev) => ({
        ...prev,
        [socketId]: { ...prev[socketId], video }
      }));
    });

    socketRef.current.on('chat-message', ({ message, userName, userId, timestamp }) => {
      setMessages((prev) => [...prev, { message, userName, userId, timestamp }]);
    });
  };

  const createPeerConnection = async (socketId, initiator, stream) => {
    const peer = new PeerConnection(
      socketId,
      socketRef.current,
      stream,
      (remoteStream) => {
        setPeers((prev) => ({
          ...prev,
          [socketId]: {
            ...prev[socketId],
            stream: remoteStream
          }
        }));
      }
    );

    peersRef.current[socketId] = peer;
    setPeers((prev) => ({
      ...prev,
      [socketId]: {
        socketId,
        audio: true,
        video: true,
        stream: null
      }
    }));

    if (initiator) {
      const offer = await peer.createOffer();
      socketRef.current.emit('offer', { offer, to: socketId });
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setLocalAudio(audioTrack.enabled);
        socketRef.current.emit('toggle-audio', { roomId, audio: audioTrack.enabled });
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setLocalVideo(videoTrack.enabled);
        socketRef.current.emit('toggle-video', { roomId, video: videoTrack.enabled });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        
        Object.values(peersRef.current).forEach(peer => {
          peer.replaceTrack(screenTrack, 'video');
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setScreenSharing(true);
        socketRef.current.emit('start-screen-share', { roomId });
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    
    Object.values(peersRef.current).forEach(peer => {
      peer.replaceTrack(videoTrack, 'video');
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    setScreenSharing(false);
    socketRef.current.emit('stop-screen-share', { roomId });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      socketRef.current.emit('chat-message', {
        roomId,
        message: messageInput,
        userName
      });
      setMessageInput('');
    }
  };

  const leaveMeeting = () => {
    cleanup();
    navigate('/');
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    Object.values(peersRef.current).forEach(peer => {
      peer.close();
    });

    if (socketRef.current) {
      socketRef.current.emit('leave-room');
      socketRef.current.disconnect();
    }
  };

  const copyMeetingLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert('Meeting link copied to clipboard!');
  };

  if (!isReady) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Initializing camera and microphone...</p>
      </div>
    );
  }

  const peerArray = Object.values(peers);

  return (
    <div className="video-room">
      <div className="room-header">
        <div className="room-info">
          <h2>Meeting: {roomId}</h2>
          <span className="participant-count">
            {peerArray.length + 1} participant{peerArray.length !== 0 ? 's' : ''}
          </span>
        </div>
        <button onClick={copyMeetingLink} className="copy-link-btn">
          📋 Copy Link
        </button>
      </div>

      <div className="video-grid-container">
        <div className={`video-grid ${peerArray.length === 0 ? 'single' : peerArray.length === 1 ? 'two' : ''}`}>
          <div className="video-wrapper local">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="video-element"
            />
            <div className="video-label">
              {userName} (You)
              {!localAudio && <span className="muted-icon">🔇</span>}
            </div>
            {!localVideo && <div className="video-off">Camera Off</div>}
          </div>

          {peerArray.map((peer) => (
            <RemoteVideo key={peer.socketId} peer={peer} />
          ))}
        </div>
      </div>

      <div className="controls">
        <button
          onClick={toggleAudio}
          className={`control-btn ${!localAudio ? 'off' : ''}`}
          title={localAudio ? 'Mute' : 'Unmute'}
        >
          {localAudio ? '🎤' : '🔇'}
        </button>

        <button
          onClick={toggleVideo}
          className={`control-btn ${!localVideo ? 'off' : ''}`}
          title={localVideo ? 'Stop Video' : 'Start Video'}
        >
          {localVideo ? '📹' : '📷'}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`control-btn ${screenSharing ? 'active' : ''}`}
          title="Share Screen"
        >
          🖥️
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className={`control-btn ${showChat ? 'active' : ''}`}
          title="Chat"
        >
          💬
          {messages.length > 0 && !showChat && (
            <span className="notification-badge">{messages.length}</span>
          )}
        </button>

        <button
          onClick={leaveMeeting}
          className="control-btn leave-btn"
          title="Leave Meeting"
        >
          📞
        </button>
      </div>

      {showChat && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>Chat</h3>
            <button onClick={() => setShowChat(false)} className="close-chat">
              ✕
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className="chat-message">
                <div className="message-header">
                  <span className="message-user">{msg.userName}</span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">{msg.message}</div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="chat-input-form">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
            />
            <button type="submit" className="send-btn">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function RemoteVideo({ peer }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (peer.stream && videoRef.current) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="video-wrapper">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="video-element"
      />
      <div className="video-label">
        Participant {peer.socketId.slice(0, 4)}
        {!peer.audio && <span className="muted-icon">🔇</span>}
      </div>
      {!peer.video && <div className="video-off">Camera Off</div>}
    </div>
  );
}

export default VideoRoom;
