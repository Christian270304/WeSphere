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

  joinChat(chatIds: number[]): void {
    this.socket.emit('joinChats', chatIds);
  }

  sendMessage(chatId: number, content: string, sender_id: number): void {
    this.socket.emit('sendMessage', { chatId, sender_id, content });
  }

  onMessage(callback: (msg: any) => void) {
    this.socket.on('newMessage', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log("Desconectado del socket: ", this.socket.id);
    }
  }


}
