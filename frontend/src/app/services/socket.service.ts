import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private messageSubject = new Subject<any>();
  public message$ = this.messageSubject.asObservable();

  constructor() {
    const backendUrl = this.getBackendUrl();
    this.socket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.setupListeners();
  }

  private getBackendUrl(): string {
    // Check environment variable first
    const envUrl = (window as any)['VITE_BACKEND_URL'];
    if (envUrl) {
      return envUrl;
    }
    
    // For development
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // For production - fallback to Render URL
    return 'https://abcs-ulxa.onrender.com';
  }

  private setupListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('message', (data: any) => {
      this.messageSubject.next(data);
    });
  }

  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  on(event: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(event, (data: any) => {
        observer.next(data);
      });
    });
  }

  off(event: string): void {
    this.socket.off(event);
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
