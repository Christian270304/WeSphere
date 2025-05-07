import { Component, ElementRef, HostListener, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { ChatSocketService } from '../../core/services/chat-socket.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../../core/services/socket.service';

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
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  @ViewChild('emojiPicker') emojiPicker!: ElementRef;

  public profileUser: any = {};
  public messages: any[] = [];
  public chats: Chat[] = [];
  public showEmojiPicker: boolean = false;
  public selectedChatId: number | null = null;
  public otherUser: any = null;
  public userId: number | null = null;
  public newMessage: string = '';

  private pendingUserId: number | null = null;
  private isSendingMessage: boolean = false;

  constructor(
    private userService: UserService,
    private chatSocketService: ChatSocketService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private socketService: SocketService,
  ) {}

  ngOnInit(): void {
    this.listenForIncomingMessages();
  
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      if (userId) {
        this.pendingUserId = userId; 
      }
    });
  
    this.loadUserAndChats(); 
  }

  ngOnDestroy(): void {
    this.chatSocketService.leaveChat(this.selectedChatId!);
    this.socketService.off('receive_message');
  }

  private loadUserAndChats(): void {
    this.authService.getUserIdFromToken().subscribe((id) => {
      this.userId = id;
      this.chatSocketService.joinUserRoom(id);
  
      this.userService.getChats().subscribe((chats) => {
        this.chats = chats;
        console.log("Chats: ", this.chats);
  
        if (this.pendingUserId) {
          this.selectChat(0, Number(this.pendingUserId));
          this.pendingUserId = null; 
          }
      });
    });
  }

  private listenForIncomingMessages(): void {
    this.socketService.on('receive_message', (msg) => {
      if (msg && msg.chat_id === this.selectedChatId && msg.userId !== this.userId) {
        this.messages.push(msg);
        this.scrollToBottom();
      }
    });
  }

  public selectChat(chatId: number, userId?: number): void {

    if (userId) {
      const chat = this.chats.find((chat) => chat.other_users[0].user_id === userId);
      if (!chat) {
        // Si el chat no existe, crearlo
        this.userService.createChat(userId).subscribe((newChat) => {
          // Agregar el nuevo chat a la lista de chats
          this.chats.push(newChat);
  
          // Seleccionar el nuevo chat
          this.selectedChatId = newChat.chat_id;
          console.log("Nuevo chat creado: ", newChat);
          this.otherUser = newChat.other_users[0].user_id;
          console.log("Nuevo user: ", this.otherUser);
          console.log("Todos los chats: ", this.chats);
        });
      } else {
        this.otherUser = chat.other_users[0].user_id;
        this.selectedChatId = chat.chat_id;
      }
      
    } else {
      this.selectedChatId = chatId;
      const chat = this.chats.find((chat) => chat.chat_id === chatId);
      if (!chat) return;

      this.otherUser = chat.other_users[0].user_id;
    }

    this.userService.getUserById(this.otherUser).subscribe((user) => {
      this.profileUser = user;
    });
    
    this.chatSocketService.joinChat(this.selectedChatId!);

    this.userService.getMessages(this.selectedChatId!).subscribe((messages) => {
      this.messages = messages;
      this.scrollToBottom();
    });
  }

  public sendMessage(): void {
    if (this.isSendingMessage) return;
    if ( !this.newMessage.trim() || !this.selectedChatId || !this.userId || !this.otherUser) return;
  
    this.isSendingMessage = true;
    
    const messageData = {
      chat_id: this.selectedChatId,
      userId: this.userId,
      content: this.newMessage,
    };
    if (this.isSendingMessage) {
      this.userService.sendMessageService(messageData).subscribe((msg) => {
        if (msg !== null) {
        this.newMessage = '';
        this.scrollToBottom();
    
        const message = {
          type: 'message',
          content: msg.content,
        };
        this.chatSocketService.sendNotification(this.userId! ,this.otherUser, message);
        
        this.isSendingMessage = false;
        }
      }, () => {
        this.isSendingMessage = false;
      });
    }
  }

  public closeChat(chatId: number): void {
    this.chatSocketService.leaveChat(chatId);
    if (this.selectedChatId === chatId) {
      this.selectedChatId = null;
      this.messages = [];
    }
  }

  public toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;

    if (this.showEmojiPicker) {
      setTimeout(() => this.adjustEmojiPickerPosition(), 0);
    }
  }

  public addEmoji(event: any): void {
    this.newMessage += event.emoji.native;
  }

  public isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  }

  @HostListener('document:click', ['$event'])
  public onClickOutside(event: MouseEvent): void {
    if (this.showEmojiPicker && this.emojiPicker && !this.emojiPicker.nativeElement.contains(event.target)) {
      this.showEmojiPicker = false;
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const messagesDiv = document.querySelector('#messages') as HTMLDivElement;
      if (messagesDiv) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    }, 100);
  }

  private adjustEmojiPickerPosition(): void {
    const picker = this.emojiPicker.nativeElement;
    const rect = picker.getBoundingClientRect();

    if (rect.right > window.innerWidth) {
      picker.style.right = '10px';
    }

    if (rect.bottom > window.innerHeight) {
      picker.style.bottom = '10px';
    }
  }
}
