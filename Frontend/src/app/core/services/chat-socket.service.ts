import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService {

  constructor(private socketService: SocketService) {}

  joinUserRoom(userId: number) {
    this.socketService.emit('join_user', userId)
  }

  joinChat(chatId: number): void {
    this.socketService.emit('join_chat', chatId);
  }

  leaveChat(chatId: number) {
    this.socketService.emit('leave_chat', chatId);
  }

  sendMessage(data: any) {
    this.socketService.emit('send_message', data);
  }

  sendNotification(userId: number, otherUserId: number, notification: { type: string; content: string; }) {
    this.socketService.emit('send_notification', { userId, otherUserId, notification });
  }

  onMessage(callback: (msg: any) => void) {
    this.socketService.on('receive_message', callback);
  }

}
