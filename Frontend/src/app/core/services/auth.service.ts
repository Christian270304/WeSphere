import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

const authConfig: AuthConfig = {
    issuer: 'https://accounts.google.com', 
    redirectUri: 'http://localhost:4200/home', 
    clientId: environment.clientId, 
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
    private isAuthenticatedSubject = new BehaviorSubject<boolean | null>(null); 
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable(); 
    

    constructor(private http: HttpClient, private router: Router) {
      this.checkAuthentication(); 
    }
  
    /**
     * Inicia sesión con las credenciales proporcionadas.
     */
    login(credentials: { username: string; password: string }): Observable<any> {
      return this.http.post(`${this.apiUrl}/auth/login`, credentials, {withCredentials: true}).pipe(
        tap(() => this.isAuthenticatedSubject.next(true))
      );
    }

    register(credentials: { username: string; email: string; password: string}): Observable<any> {
      return this.http.post(`${this.apiUrl}/auth/register`, credentials, {withCredentials: true}).pipe(
        tap(() => this.isAuthenticatedSubject.next(true))
      );
    }

    loginWithOAuth (oauth = '') {
      const width = 500;
      const height = 600;

      const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

      if (isMobile) {
        window.location.href = `${this.apiUrl}/auth/${oauth}`;
        return;
      }

      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height);

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
          window.removeEventListener('message', listener); 
        }
      };
    
      window.addEventListener('message', listener);
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
    private checkAuthentication(): void {
      this.http.get<{ authenticated: boolean }>(`${this.apiUrl}/auth/check`, { withCredentials: true })
        .subscribe((response) => {
            console.log("Respuesta de autenticacion: ", response);
            this.isAuthenticatedSubject.next(response.authenticated);
     
        });
    }
  
    /**
     * Devuelve el estado actual de autenticación.
     */
    isAuthenticated(): boolean {
        return this.isAuthenticatedSubject.getValue() === true;
    }

    getUserIdFromToken(): Observable<number> {
      return this.http.get<{ user: number }>(`${this.apiUrl}/auth/check`, {
        withCredentials: true
      }).pipe(map(res => res.user));
    }

  }