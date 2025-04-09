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
  user$ = this.userSubject.asObservable();
  users$ = this.usersSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();
  chats$ = this.chatsSubject.asObservable();

  private anoterUserSubject = new BehaviorSubject<any>(null);
  anotherUser$ = this.anoterUserSubject.asObservable();

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

  getAnotherUser (userId: number) {
    this.http.get<any>(`${this.apiUrl}/auth/user/${userId}`, {withCredentials: true}).subscribe(
      (data) => {
        if (data) {
          console.log("Usuario obtenido: ", data.user);
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

  getUsers () {
    this.http.get<any>(`${this.apiUrl}/auth/users/`, {withCredentials: true}).subscribe(
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
       console.log("Mensajes obtenidos: ", response.messages); 
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
        console.error('Error al obtener usuarios:', error);
      });
      return this.chats$;
  }
}


