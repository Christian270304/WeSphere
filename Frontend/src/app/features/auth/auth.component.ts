import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterOutlet} from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  isAuthenticated = false;
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login({ username: this.username, password: this.password }).subscribe((res) => {
      this.authService.setToken(res.token);
      this.router.navigate(['/home']);
      this.isAuthenticated = true;
    }, error => {
      console.error('Error en login', error);
    });
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
