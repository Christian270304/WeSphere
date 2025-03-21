import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-actions',
  imports: [],
  templateUrl: './user-actions.component.html',
  styleUrl: './user-actions.component.scss'
})
export class UserActionsComponent {
  constructor(private router: Router, private authService: AuthService) {}

  async logout() {
    await this.authService.logout();
    this.router.navigate(['']);
  }
}
