import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Verifica si el usuario puede activar la ruta.
   */
  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      filter(value => value !== null), 
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['']);
        }
        return isAuthenticated;
      })
    );
  }
}
