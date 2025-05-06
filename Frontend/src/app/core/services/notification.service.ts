import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private socketService: SocketService) {}

  onNotification(callback: (data: any) => void) {
    this.socketService.on('receive_notification', callback);
  }

  sendNotification(data: { userId: number; type: string; content: string; referenceId?: number }): void {
    this.socketService.emit('send_notification', data);
  }

  disconnect(userId: number): void {
    this.socketService.emit('leave_user', userId);
  }
}
