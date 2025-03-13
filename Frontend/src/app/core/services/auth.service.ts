import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth';

    constructor(private http: HttpClient) { }

    login(credentials: { username: string; password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials);
    }

    logout(): void {
        localStorage.removeItem('token');
    }

    setToken(token: string): void {
        localStorage.setItem('token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        console.log('Verificando autenticación:', token); // Agregar para debug
        return token !== null; // Devuelve true si hay token
      }
}