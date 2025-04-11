import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterOutlet} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ErrorService } from '../../core/services/error.service';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, ErrorMessageComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  isAuthenticated = false;
  isLoading = false;
  isLoginFormVisible:boolean = true;
  username: string = '';
  password: string = '';
  Reusername: string = '';
  email: string = '';
  Repassword: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService, private router: Router, private errorService: ErrorService) {}

  ngOnInit(): void {
         
      this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigate(['/home']); // Redirige al home si está autenticado
        }
      });
      
  }

  login() {
    if (this.username === '' || this.password === '') {
      this.errorService.setError('Por favor, completa todos los campos requeridos.'); 
      return;
    }
    this.authService.login({ username: this.username, password: this.password }).subscribe((res) => {
      this.isAuthenticated = true;
      this.router.navigate(['/home']);
  
    }, error => {
      console.error('Error en el inicio de sesión:', error);
      if (error.status === 400) this.errorService.setError(error.error.msg);
    });
  }

  register () {
    // Verificar los datos del formulario antes de enviar la solicitud
    if (this.Reusername === '' || this.email === '' || this.Repassword === '' || this.confirmPassword === '') {
      this.errorService.setError('Por favor, completa todos los campos requeridos.');
      return;
    }

    // Verificar que el username no contenga espacios
    if (/\s/.test(this.Reusername)) {
      this.errorService.setError('El nombre de usuario no puede contener espacios.');
      return;
    }

    // Verificar que el email tenga un formato válido
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      this.errorService.setError('El correo electrónico no es válido.');
      return;
    }

    // Verificar que las contraseñas coincidan
    if (this.Repassword !== this.confirmPassword) {
      this.errorService.setError('Las contraseñas no coinciden.');
      return;
    }
    this.authService.register({ username: this.Reusername, email: this.email, password: this.Repassword}).subscribe((res)=> {
      this.isAuthenticated = true;
      this.router.navigate(['/home']);
    }, error => {
      if (error.status === 400) this.errorService.setError(error.error.msg);
    });
  }
  
  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  toggleRegisterForm(): void {
    this.isLoginFormVisible = false;
  }

  toggleLoginForm(): void {
    this.isLoginFormVisible = true;
  }


  
}
