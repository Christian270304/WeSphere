import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private userSubject = new BehaviorSubject<any>(null);
  private usersSubject = new BehaviorSubject<any>(null);
  private messagesSubject = new BehaviorSubject<any>(null);
  private chatsSubject = new BehaviorSubject<any>(null);
  private newMessageSubject = new BehaviorSubject<any>(null);
  private profileId: number | null = null;
  user$ = this.userSubject.asObservable();
  users$ = this.usersSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();
  chats$ = this.chatsSubject.asObservable();

  newMessage$ = this.newMessageSubject.asObservable();

  private anoterUserSubject = new BehaviorSubject<any>(null);
  anotherUser$ = this.anoterUserSubject.asObservable();

  private userByUsernameSubject = new BehaviorSubject<any>(null);
  userByUsername$ = this.userByUsernameSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUser () {
    this.http.get<any>(`${this.apiUrl}/auth/user/`, {withCredentials: true}).subscribe(
      (data) => {
        if (data) {
          this.userSubject.next(data.user);
        } else {
          console.error('Error: La API no devolvió un objeto', data);
        }
      },
      (error) => {
        console.error('Error al obtener usuario:', error);
      }
    );
    return this.user$;
  }

  getUserById (userId: number) {
    this.http.get<any>(`${this.apiUrl}/auth/user/${userId}`, {withCredentials: true}).subscribe(
      (data) => {
        if (data) {
          this.anoterUserSubject.next(data.user);
        } else {
          console.error('Error: La API no devolvió un objeto', data);
        }
      },
      (error) => {
        console.error('Error al obtener usuario:', error);
      }
    );
    return this.anotherUser$;
  }

  getUserByUsername (username: string) {
    this.http.get<any>(`${this.apiUrl}/auth/profile/${username}`, {withCredentials: true}).subscribe(
      (data) => {
        if (data) {
          this.userByUsernameSubject.next(data);
        } else {
          console.error('Error: La API no devolvió un objeto', data);
        }
      },
      (error) => {
        console.error('Error al obtener usuario:', error);
      }
    );
    return this.userByUsername$;
  }

  getUsers (userId: number) {
    this.http.get<any>(`${this.apiUrl}/auth/user/${userId}`, {withCredentials: true}).subscribe(
      (data) => {
        if (data) {
          this.usersSubject.next(data.users);
        } else {
          console.error('Error: La API no devolvió un objeto', data);
        }
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    );
    return this.users$;
  }

  getMessages (chatId: number) {
    this.http.get<any>(`${this.apiUrl}/auth/messages/${chatId}`, {withCredentials: true}).subscribe(
      (response) => { 
       this.messagesSubject.next(response.messages);
      }
    );
    return this.messages$;
  }

  getChats () {
    this.http.get<any>(`${this.apiUrl}/auth/chats`, {withCredentials: true}).subscribe(
      (data) => {
        if (data) {
          this.chatsSubject.next(data.chats);
        } else {
          console.error('Error: La API no devolvió un objeto', data);
        }
      },
      (error) => {
        console.error('Error al obtener chats:', error);
      });
      return this.chats$;
  }

  sendMessage (content: {chat_id: number, content: string, userId: number}) {
    this.http.post<any>(`${this.apiUrl}/auth/newMessage`, content, {withCredentials: true}).subscribe(
       (response) => {
        this.newMessageSubject.next(response.newMessage);
        // const currentMessages = this.messagesSubject.value || [];
        // this.messagesSubject.next([...currentMessages]);
      },
       (error) => {
        console.error('Error al enviar el mensaje:', error);
      }
    );
    return this.newMessage$;
  }

  getFollowStatus(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/users/${userId}/follow-status`, { withCredentials: true });
  }

  toggleFollow(userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/users/${userId}/follow`, {}, { withCredentials: true });
  }

  getFriends(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/friends`, { withCredentials: true });
  }

}


