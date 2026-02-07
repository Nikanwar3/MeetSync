const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

class PeerConnection {
  constructor(socketId, socket, localStream, onRemoteStream) {
    this.socketId = socketId;
    this.socket = socket;
    this.localStream = localStream;
    this.onRemoteStream = onRemoteStream;
    this.peerConnection = null;
    this.remoteStream = new MediaStream();
    this.init();
  }

  init() {
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle remote tracks
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track);
      });
      this.onRemoteStream(this.remoteStream);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: this.socketId
        });
      }
    };

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${this.socketId}:`, this.peerConnection.connectionState);
    };
  }

  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async createAnswer() {
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  async setRemoteDescription(description) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    } catch (error) {
      console.error('Error setting remote description:', error);
      throw error;
    }
  }

  async addIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
  }

  replaceTrack(newTrack, kind) {
    const sender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === kind);
    if (sender) {
      sender.replaceTrack(newTrack);
    }
  }
}

export default PeerConnection;
