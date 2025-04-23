import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket | null;

  constructor(private authService: AuthService) {}

  connect(): void {
    const userId = this.authService.getUserIdFromToken();
    if (userId && !this.socket) {
      this.socket = io('http://localhost:3000', {
        withCredentials: true,
      });

      this.socket.on('connect', () => {
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
    console.log("Emitiendo evento: ", event, " con datos: ", data, " desde el socket: ", this.socket);
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

}
