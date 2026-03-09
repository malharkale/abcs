import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  roomId: string = '';
  generatedRoomId: string = '';
  showCreateRoom: boolean = false;
  loading: boolean = false;
  error: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.socketService.off('room-full');
    this.socketService.off('peer-disconnected');
  }

  createRoom(): void {
    this.loading = true;
    this.error = '';
    this.generatedRoomId = this.generateRoomId();
    this.showCreateRoom = true;
    this.loading = false;
  }

  joinRoom(): void {
    if (!this.roomId || this.roomId.trim() === '') {
      this.error = 'Please enter a Room ID';
      return;
    }

    this.loading = true;
    this.error = '';

    this.socketService.emit('join-room', {
      roomId: this.roomId.trim(),
      userId: this.generateUserId()
    });

    // Listen for response
    this.socketService.on('room-full').pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.error = 'Room is full. Only 2 users allowed.';
      this.loading = false;
    });

    this.socketService.on('room-joined').pipe(
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      this.loading = false;
      this.router.navigate(['/call', this.roomId.trim()]);
    });

    this.socketService.on('room-error').pipe(
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      this.error = data.message || 'Error joining room';
      this.loading = false;
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (this.loading) {
        this.error = 'Connection timeout. Please try again.';
        this.loading = false;
      }
    }, 10000);
  }

  joinGeneratedRoom(): void {
    this.roomId = this.generatedRoomId;
    this.joinRoom();
  }

  copyRoomId(): void {
    navigator.clipboard.writeText(this.generatedRoomId).then(() => {
      alert('Room ID copied to clipboard!');
    });
  }

  private generateRoomId(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private generateUserId(): string {
    return 'user-' + Math.random().toString(36).substr(2, 9);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
