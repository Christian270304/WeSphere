import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
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
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.getToken() !== null);
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(private http: HttpClient, private oauthService: OAuthService, private router: Router) {
        this.configureOAuth();
    }

    private configureOAuth() {
        this.oauthService.configure(authConfig);
        this.oauthService.loadDiscoveryDocumentAndTryLogin().catch((e) => {
            console.warn('OAuth2 error',e);
        });
      }

    login(credentials: { username: string; password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/login`, credentials);
    }

    loginWithGoogle(): void {
        this.oauthService.initCodeFlow();
    }

    logout(): Promise<void> {
        return new Promise((resolve) => {
            localStorage.removeItem('token');
            this.isAuthenticatedSubject.next(false);
            this.oauthService.logOut();
            resolve();
        });
    }

    setToken(token: string): void {
        localStorage.setItem('token', token);
        this.isAuthenticatedSubject.next(true);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return this.getToken() !== null;
    }
}