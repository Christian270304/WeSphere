import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isAuth = this.authService.isAuthenticated();
    console.log('isAuth:', isAuth); // Agregar para debug

    if (isAuth) {
      return true;
    } else {
      console.warn('Acceso denegado: No autenticado');
      this.router.navigate(['/']); // Redirige al login si no está autenticado
      return false;
    }
  }
}
