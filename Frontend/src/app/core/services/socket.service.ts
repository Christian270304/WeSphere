import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { ChatSocketService } from './chat-socket.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket | null;

  constructor(private authService: AuthService) {}

  connect(): void {
    const userId = this.authService.getUserIdFromToken();
    if (userId && !this.socket) {
      this.socket = io('https://wesphere-production.up.railway.app', {
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        userId.subscribe((id: number) => {
          this.socket!.emit('join_user', id)
        });
        console.log('Conectado al servidor de Socket.IO');
      });

      this.socket.on('disconnect', () => {
        console.log('Desconectado del servidor de Socket.IO');
      });
    }
  }

  public getSocket(): Socket {
    if (!this.socket) {
      throw new Error('El socket no está conectado. Llama a connect() primero.');
    }
    return this.socket;
  }

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  off(event: string): void {
    this.socket!.off(event);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

}
