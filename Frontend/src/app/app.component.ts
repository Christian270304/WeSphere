import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  showHeader: boolean = true;

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url;
      this.showHeader = !['/'].includes(currentRoute);
    });
  }
}
