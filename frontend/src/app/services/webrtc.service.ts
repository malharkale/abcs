import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

interface RTCConfig {
  iceServers: RTCIceServer[];
  sdpTransform?: Function;
}

@Injectable({
  providedIn: 'root'
})
export class WebRtcService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;

  remoteStreamSubject = new Subject<MediaStream>();
  remoteStream$ = this.remoteStreamSubject.asObservable();

  localStreamSubject = new Subject<MediaStream>();
  localStream$ = this.localStreamSubject.asObservable();

  connectionStatusSubject = new Subject<string>();
  connectionStatus$ = this.connectionStatusSubject.asObservable();

  iceCandidate$ = new Subject<RTCIceCandidate>();
  offerSubject = new Subject<RTCSessionDescriptionInit>();
  answerSubject = new Subject<RTCSessionDescriptionInit>();

  constructor() {}

  private getRTCConfig(): RTCConfiguration {
    return {
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] },
        { urls: ['stun:stun2.l.google.com:19302'] }
      ]
    };
  }

  async initializeLocalStream(): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStreamSubject.next(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async createPeerConnection(): Promise<RTCPeerConnection> {
    try {
      this.peerConnection = new RTCPeerConnection(this.getRTCConfig());

      // Add local stream tracks to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }

      // Handle remote stream
      this.peerConnection.ontrack = (event: RTCTrackEvent) => {
        console.log('Remote track received:', event.track.kind);
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
          this.remoteStreamSubject.next(this.remoteStream);
        }
        this.remoteStream.addTrack(event.track);
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          this.iceCandidate$.next(event.candidate);
        }
      };

      // Connection state monitoring
      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection) {
          this.connectionStatusSubject.next(this.peerConnection.connectionState);
          if (this.peerConnection.connectionState === 'failed') {
            this.restartICE();
          }
        }
      };

      this.peerConnection.oniceconnectionstatechange = () => {
        if (this.peerConnection) {
          console.log('ICE connection state:', this.peerConnection.iceConnectionState);
        }
      };

      return this.peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);
      this.offerSubject.next(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.answerSubject.next(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      const rtcDescription = new RTCSessionDescription(description);
      await this.peerConnection.setRemoteDescription(rtcDescription);
    } catch (error) {
      console.error('Error setting remote description:', error);
      throw error;
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (this.peerConnection && candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  async switchCamera(): Promise<void> {
    try {
      if (!this.localStream) {
        throw new Error('Local stream not initialized');
      }

      // Get the current video track
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track found');
      }

      const settings = videoTrack.getSettings();
      const currentFacingMode = (settings.facingMode as any) || 'user';
      const facingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: { facingMode }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      const newVideoTrack = newStream.getVideoTracks()[0];

      if (this.peerConnection) {
        const sender = this.peerConnection
          .getSenders()
          .find(s => s.track?.kind === 'video');

        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }

      // Stop old track and replace in local stream
      videoTrack.stop();
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  }

  private async restartICE(): Promise<void> {
    try {
      if (this.peerConnection) {
        await this.peerConnection.restartIce();
      }
    } catch (error) {
      console.error('Error restarting ICE:', error);
    }
  }

  closeConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
  }

  getConnectionState(): string {
    return this.peerConnection?.connectionState || 'new';
  }

  getIceConnectionState(): string {
    return this.peerConnection?.iceConnectionState || 'new';
  }
}
