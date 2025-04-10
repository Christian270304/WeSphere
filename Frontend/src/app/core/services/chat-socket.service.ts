import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService {
  private socket!: Socket;

  constructor() { }

  connect(): void {
    if (!this.socket) {
      this.socket = io('http://localhost:3000', {
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log("Conectado al socket: ", this.socket.id);
      })
    }
  }

  joinUserRoom(userId: number) {
    this.socket.emit('join_user', userId)
  }

  joinChat(chatId: number): void {
    this.socket.emit('join_chat', chatId);
  }

  leaveChat(chatId: number) {
    this.socket.emit('leave_chat', chatId);
  }

  sendMessage(data: any) {
    this.socket.emit('send_message', data);
  }

  onMessage(callback: (msg: any) => void) {
    this.socket.on('receive_message', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log("Desconectado del socket: ", this.socket.id);
    }
  }
}
