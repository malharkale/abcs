import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { WebRtcService } from '../../services/webrtc.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('localVideo', { static: false }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: false }) remoteVideo!: ElementRef<HTMLVideoElement>;

  roomId: string = '';
  userId: string = '';
  isAudioEnabled: boolean = true;
  isVideoEnabled: boolean = true;
  connectionStatus: string = 'connecting';
  callStartTime: Date | null = null;
  callDuration: string = '00:00';
  isMobileView: boolean = false;
  isFullscreen: boolean = false;
  showMenu: boolean = false;

  private destroy$ = new Subject<void>();
  private durationInterval: any;
  private isInitiator: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private webrtcService: WebRtcService
  ) {
    this.userId = 'user-' + Math.random().toString(36).substr(2, 9);
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.roomId = params['roomId'];
      this.initializeCall();
    });
  }

  ngAfterViewInit(): void {
    this.setupVideoStreams();
  }

  private checkMobileView(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  private async initializeCall(): Promise<void> {
    try {
      // Get local stream
      await this.webrtcService.initializeLocalStream();

      // Setup WebRTC connection
      await this.webrtcService.createPeerConnection();

      // Connect to socket
      this.setupSocketListeners();

      // Notify server we're ready
      this.socketService.emit('peer-ready', {
        roomId: this.roomId,
        userId: this.userId
      });
    } catch (error) {
      console.error('Error initializing call:', error);
      alert('Error accessing camera/microphone. Please check permissions.');
      this.endCall();
    }
  }

  private setupVideoStreams(): void {
    // Setup local video
    this.webrtcService.localStream$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(stream => {
      if (this.localVideo && this.localVideo.nativeElement) {
        this.localVideo.nativeElement.srcObject = stream;
      }
    });

    // Setup remote video
    this.webrtcService.remoteStream$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(stream => {
      if (this.remoteVideo && this.remoteVideo.nativeElement) {
        this.remoteVideo.nativeElement.srcObject = stream;
        this.callStartTime = new Date();
        this.startCallTimer();
      }
    });

    // Connection status
    this.webrtcService.connectionStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      this.connectionStatus = status;
      if (status === 'disconnected' || status === 'failed' || status === 'closed') {
        this.endCall();
      }
    });
  }

  private setupSocketListeners(): void {
    // Listen for signaling messages
    this.socketService.on('offer').pipe(
      takeUntil(this.destroy$)
    ).subscribe(async (offer: RTCSessionDescriptionInit) => {
      try {
        await this.webrtcService.setRemoteDescription(offer);
        const answer = await this.webrtcService.createAnswer();
        this.socketService.emit('answer', {
          roomId: this.roomId,
          answer
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    this.socketService.on('answer').pipe(
      takeUntil(this.destroy$)
    ).subscribe(async (answer: RTCSessionDescriptionInit) => {
      try {
        await this.webrtcService.setRemoteDescription(answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    this.socketService.on('ice-candidate').pipe(
      takeUntil(this.destroy$)
    ).subscribe(async (candidate: RTCIceCandidateInit) => {
      try {
        await this.webrtcService.addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    // When peer joins, create and send offer
    this.socketService.on('peer-joined').pipe(
      takeUntil(this.destroy$)
    ).subscribe(async (data: any) => {
      console.log('Peer joined, creating offer');
      this.isInitiator = true;
      try {
        const offer = await this.webrtcService.createOffer();
        this.socketService.emit('offer', {
          roomId: this.roomId,
          offer
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    });

    // Listen for ICE candidates to send
    this.webrtcService.iceCandidate$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(candidate => {
      this.socketService.emit('ice-candidate', {
        roomId: this.roomId,
        candidate: candidate.toJSON()
      });
    });

    // Handle peer disconnect
    this.socketService.on('peer-disconnected').pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('Peer disconnected');
      this.endCall();
    });

    // Handle room error
    this.socketService.on('room-error').pipe(
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      alert(data.message || 'Error in room');
      this.router.navigate(['/']);
    });
  }

  toggleAudio(): void {
    this.isAudioEnabled = !this.isAudioEnabled;
    this.webrtcService.toggleAudio(this.isAudioEnabled);
  }

  toggleVideo(): void {
    this.isVideoEnabled = !this.isVideoEnabled;
    this.webrtcService.toggleVideo(this.isVideoEnabled);
  }

  async switchCamera(): Promise<void> {
    try {
      await this.webrtcService.switchCamera();
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  }

  toggleFullscreen(): void {
    if (!this.isFullscreen) {
      const elem = document.documentElement as any;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
      this.isFullscreen = true;
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      this.isFullscreen = false;
    }
  }

  endCall(): void {
    this.socketService.emit('leave-room', {
      roomId: this.roomId,
      userId: this.userId
    });

    if (this.durationInterval) {
      clearInterval(this.durationInterval);
    }

    this.webrtcService.closeConnection();
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 500);
  }

  private startCallTimer(): void {
    this.durationInterval = setInterval(() => {
      if (this.callStartTime) {
        const elapsed = new Date().getTime() - this.callStartTime.getTime();
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        this.callDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    }, 1000);
  }

  getConnectionStatusColor(): string {
    switch (this.connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  getConnectionStatusText(): string {
    switch (this.connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'failed':
        return 'Connection Failed';
      default:
        return 'Unknown';
    }
  }

  ngOnDestroy(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
    }
    this.webrtcService.closeConnection();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
