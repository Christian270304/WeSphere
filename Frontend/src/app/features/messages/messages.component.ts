import { Component } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ChatSocketService } from '../../core/services/chat-socket.service';

@Component({
  selector: 'app-messages',
  imports: [CommonModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {
  public profileUser: any = {};
  public messagesRight: any = {};
  public messagesLeft: any = {};
  public messages: any = {};
  public chats: any = {};
  selectedChatId: number | null = null;

  constructor(private userService: UserService, private chatSocketService: ChatSocketService) {
    
    this.userService.getAnotherUser(2).subscribe((user) => {
      this.profileUser = user;
    });
  }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    this.userService.getChats(Number(userId)).subscribe((chats) => {
      this.chats = chats;
    });



    this.chatSocketService.connect();
    const chats = [1]
    this.chatSocketService.joinChat(chats);

    this.chatSocketService.onMessage((msg) => {
      this.messages.push(msg); // Agregar el mensaje al array
      setTimeout(() => {
        const messagesDiv = document.querySelector('#messages') as HTMLDivElement;
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Desplazar hacia abajo
      }, 0);
    });

    const input = document.querySelector('#message') as HTMLInputElement;
    const sendButton = document.querySelector('#send') as HTMLButtonElement;
    sendButton.addEventListener('click', () => {
      const message = input.value;
      this.chatSocketService.sendMessage( 1, message, 3 );
      input.value = ''; // Limpiar el campo de entrada después de enviar el mensaje
    });
    
  }

  ngOnDestroy() {
    this.chatSocketService.disconnect();
  }

  selectChat(chatId: number) {
    this.selectedChatId = chatId;
    console.log(chatId);
    const userId = localStorage.getItem('userId');
    const parsedUserId = Number(userId);
    this.userService.getMessages(Number(chatId)).subscribe((messages) => {
      
      this.messagesRight = messages.filter((message: any) => Number(message.sender_id) === parsedUserId);
      this.messagesLeft = messages.filter((message: any) => Number(message.sender_id) !== parsedUserId);
      // Combinar y ordenar los mensajes por tiempo
      this.messages = [...this.messagesRight, ...this.messagesLeft].sort((a: any, b: any) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
     
    });
  }
}
