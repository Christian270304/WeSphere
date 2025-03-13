import { Component } from '@angular/core';
import { AuthComponent } from "./features/auth/auth.component";
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [ AuthComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.getToken()) {
      console.log('Sesión activa');
    } else {
      console.log('No hay sesión iniciada');
    }
  }
}
