import { Component } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ChatSocketService } from '../../core/services/chat-socket.service';

interface Chat {
  chat_id: number;
  last_message: string;
  other_users: {
    user_id: number;
    username: string;
    profile_image: string;
  }[];
}

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
  public chats: Chat[] = [];
  selectedChatId: number | null = null;
  otherUser: any = null;

  constructor(private userService: UserService, private chatSocketService: ChatSocketService) {}

  ngOnInit(): void {
    this.userService.getChats().subscribe((chats) => {
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
    this.otherUser = this.chats.find(chat => chat.chat_id === chatId);
    console.log("Chat seleccionado: ", this.otherUser.other_users[0].user_id);
    this.userService.getAnotherUser(this.otherUser.other_users[0].user_id).subscribe((user) => {
      this.profileUser = user;
      console.log("Usuario seleccionado: ", this.profileUser);
    });
    this.userService.getMessages(Number(chatId)).subscribe((messages) => {
      console.log("Mensajes: ",messages);
      this.messages = messages;
      // this.messagesRight = messages.filter((message: any) => Number(message.sender_id) === parsedUserId);
      // this.messagesLeft = messages.filter((message: any) => Number(message.sender_id) !== parsedUserId);
      // // Combinar y ordenar los mensajes por tiempo
      // this.messages = [...this.messagesRight, ...this.messagesLeft].sort((a: any, b: any) => {
      //   return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      // });
     
    });
  }
}
