import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterOutlet} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ErrorService } from '../../core/services/error.service';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { HomeComponent } from '../home/home.component';
import { SocketService } from '../../core/services/socket.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, ErrorMessageComponent, CommonModule],
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
  passwordVisible: boolean = false;
  passwordVisibleConfirm: boolean = false;

  constructor(private authService: AuthService, private router: Router, private errorService: ErrorService, private socketService: SocketService) {}

  ngOnInit(): void { 
    this.authService.checkAuthentication().subscribe((res) => {
      this.isAuthenticated = res;
      if (this.isAuthenticated) {
        this.isLoading = true;
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      }  
    });
  }

  login() {
    if (this.username === '' || this.password === '') {
      this.errorService.setError('Si us plau, completa tots els camps requerits.');
      return;
    }
    this.authService.login({ username: this.username, password: this.password }).subscribe((res) => {
      this.isAuthenticated = true;
      this.socketService.connect(); 
      this.router.navigate(['/home']);
  
    }, error => {
      console.error('Error en l\'inici de sessió:', error);
      if (error.status === 400) this.errorService.setError(error.error.msg);
    });
  }

  register () {
    // Verificar los datos del formulario antes de enviar la solicitud
    if (this.Reusername === '' || this.email === '' || this.Repassword === '' || this.confirmPassword === '') {
      this.errorService.setError('Si us plau, completa tots els camps requerits.');
      return;
    }

    // Verificar que el username no contenga espacios
    if (/\s/.test(this.Reusername)) {
      this.errorService.setError('El nom d\'usuari no pot contenir espais.');
      return;
    }

    // Verificar que el email tenga un formato válido
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      this.errorService.setError('El correu electrònic no és vàlid.');
      return;
    }

    // Verificar que las contraseñas coincidan
    if (this.Repassword !== this.confirmPassword) {
      this.errorService.setError('Les contrasenyes no coincideixen.');
      return;
    }

    // Verificar que la contrsenya tenga al menos 8 caràcteres, una lletra majúscula, una lletra minúscula i un número
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordPattern.test(this.Repassword)) {
      this.errorService.setError('La contrasenya ha de tenir almenys 8 caràcters, una lletra majúscula, una lletra minúscula i un número.');
      return;
    }
    
    this.authService.register({ username: this.Reusername, email: this.email, password: this.Repassword}).subscribe((res)=> {
      this.isAuthenticated = true;
      this.socketService.connect(); 
      this.router.navigate(['/home']);
    }, error => {
      if (error.status === 400) this.errorService.setError(error.error.msg);
    });
  }
  
  loginWithGoogle () {
    this.authService.loginWithOAuth('google').then((success) => {
      if (success) {
        this.isAuthenticated = true;
        this.socketService.connect(); 
        this.router.navigate(['/home']);
      } else {
        this.errorService.setError('Error en iniciar sessió amb Google.');
      }
    });
  }

  loginWithReddit () {
    this.authService.loginWithOAuth('reddit').then((success) => {
      if (success) {
        this.isAuthenticated = true;
        this.socketService.connect(); 
        this.router.navigate(['/home']);
      } else {
        this.errorService.setError('Error en iniciar sessió amb Reddit.');
      }
    });;
  }

  loginWithDiscord () {
    this.authService.loginWithOAuth('discord').then((success) => {
      if (success) {
        this.isAuthenticated = true;
        this.socketService.connect(); 
        this.router.navigate(['/home']);
      } else {
        this.errorService.setError('Error en iniciar sessió amb Discord.');
      }
    });;
  }

  toggleRegisterForm(): void {
    this.isLoginFormVisible = false;
  }

  toggleLoginForm(): void {
    this.isLoginFormVisible = true;
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  togglePasswordVisibilityConfirm(): void {
    this.passwordVisibleConfirm = !this.passwordVisibleConfirm;
  }

  
}
