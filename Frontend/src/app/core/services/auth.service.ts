import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';

const authConfig: AuthConfig = {
    issuer: 'https://accounts.google.com', 
    redirectUri: 'http://localhost:4200/home', 
    responseType: 'code',
    scope: 'openid profile email',
    strictDiscoveryDocumentValidation: false,
    showDebugInformation: true,
    useHttpBasicAuth: false,
    disablePKCE: false,
    requestAccessToken: true
  };

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl; 
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false); 
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable(); 
    

    constructor(private http: HttpClient, private router: Router) {
    }
  
    /**
     * Inicia sesión con las credenciales proporcionadas.
     */
    login(credentials: { username: string; password: string }): Observable<any> {
      return this.http.post(`${this.apiUrl}/auth/login`, credentials, {withCredentials: true}).pipe(
        tap(() => {
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/home']);
        })
      );
    }

    register(credentials: { username: string; email: string; password: string}): Observable<any> {
      return this.http.post(`${this.apiUrl}/auth/register`, credentials, {withCredentials: true}).pipe(
        tap(() => this.isAuthenticatedSubject.next(true))
      );
    }

    loginWithOAuth(oauth: string): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const width = 500;
        const height = 600;
    
        const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    
        if (isMobile) {
          window.location.href = `${this.apiUrl}/auth/${oauth}`;
          resolve(false); 
          return;
        }
    
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
    
        const popup = window.open(
          `${this.apiUrl}/auth/${oauth}`,
          '_blank',
          `width=${width},height=${height},top=${top},left=${left}`
        );
    
        const listener = (event: MessageEvent) => {
          // Seguridad: verifica origen
          if (event.origin !== 'http://localhost:3000') return;
    
          if (event.data.success) {
            this.isAuthenticatedSubject.next(true);
            this.router.navigate(['/home']);
            resolve(true); 
          } else {
            resolve(false); 
          }
    
          window.removeEventListener('message', listener);
          popup?.close();
        };
    
        window.addEventListener('message', listener);
    
        const interval = setInterval(() => {
          if (popup?.closed) {
            clearInterval(interval);
            window.removeEventListener('message', listener);
            resolve(false); 
          }
        }, 500);
      });
    }

    /**
     * Cierra la sesión del usuario.
     */
    logout() {
        localStorage.removeItem('userId');
            this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe(
            (response) => {
                this.isAuthenticatedSubject.next(false); 
                this.router.navigate(['/']); 
            }
        );
    }
  
    /**
     * Verifica si el usuario está autenticado llamando al backend.
     */
    public checkAuthentication(): Observable<boolean> {
      return this.http.get<{ authenticated: boolean }>(`${this.apiUrl}/auth/check`, { withCredentials: true }).pipe(
        tap(response => {
          this.isAuthenticatedSubject.next(response.authenticated);
        }),
        map(response => response.authenticated),
        catchError(() => {
          this.isAuthenticatedSubject.next(false);
          return of(false);
        })
      );
    }
    
  
    /**
     * Devuelve el estado actual de autenticación.
     */
    isAuthenticated(): Observable<boolean> {
        return of(this.isAuthenticatedSubject.getValue() );
    }

    getUserIdFromToken(): Observable<number> {
      return this.http.get<{ user: number }>(`${this.apiUrl}/auth/check`, {
        withCredentials: true
      }).pipe(map(res => res.user));
    }

    deleteAccount(): Observable<any> {
      return this.http.delete<any>(`${this.apiUrl}/auth/user/delete`, { withCredentials: true }).pipe(
        tap(() => {
          this.isAuthenticatedSubject.next(false);  
          this.logout();
        })
      );;
    }

  }