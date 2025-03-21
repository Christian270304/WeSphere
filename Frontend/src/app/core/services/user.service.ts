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
  user$ = this.userSubject.asObservable();
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUser () {
    const userId = localStorage.getItem('userId');
    this.http.get<any>(`${this.apiUrl}/auth/user/${userId}`).subscribe(
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

  getUsers () {
    this.http.get<any>(`${this.apiUrl}/auth/users`).subscribe(
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
}
