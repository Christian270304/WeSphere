import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    return this.authService.checkAuthentication().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['']);
          return false;
        } 
        return true;
      })
    );
  }
  
}
