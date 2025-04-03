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
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router, private errorService: ErrorService) {}

  ngOnInit(): void {
    // this.authService.isLoading$.subscribe((loading) => {
    //   this.isLoading = loading;
    //   if (!loading) {
    //     this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
    //       if (isAuthenticated) {
    //         this.router.navigate(['/home']); // Redirige al home si está autenticado
    //       }
    //     });
    //   }
    // });
  }

  login() {
    this.authService.login({ username: this.username, password: this.password }).subscribe((res) => {
      localStorage.setItem('userId', res.user.id);
      this.isAuthenticated = true;
      this.router.navigate(['/home']);
  
    }, error => {
      console.log(error.status);
      if (error.status === 400) {
        this.errorService.setError(error.error.msg);
      }
      console.error('Error en login', error);
    });
  }
  
  loginWithGoogle() {
    // this.authService.loginWithGoogle();
  }

  toggleForm() {
    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');
    
    loginSection!.style.transform = loginSection!.style.transform === 'translateX(-100%)' 
        ? 'translateX(0)' 
        : 'translateX(-100%)';
        
    signupSection!.style.transform = signupSection!.style.transform === 'translateX(-100%)' 
        ? 'translateX(0)' 
        : 'translateX(-100%)';
  }

  
}
