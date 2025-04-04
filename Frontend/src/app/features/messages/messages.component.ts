import { Component } from '@angular/core';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-messages',
  imports: [],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {
  public profileUser: any = {};
  public messagesRight: any = {};
  public messagesLeft: any = {};

  constructor(private userService: UserService) {
    
    this.userService.getAnotherUser(2).subscribe((user) => {
      this.profileUser = user;
    });
  }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    const parsedUserId = Number(userId);
    this.userService.getMessages(1).subscribe((messages) => {
      console.log("Mensajes obtenidos: ", messages);
      this.messagesRight = messages.filter((message: any) => Number(message.sender_id) === parsedUserId);
      this.messagesLeft = messages.filter((message: any) => Number(message.sender_id) !== parsedUserId);
      console.log("Mensajes de la derecha: ", this.messagesRight);
      console.log("Mensajes de la izquierda: ", this.messagesLeft);
    });
  }
}
