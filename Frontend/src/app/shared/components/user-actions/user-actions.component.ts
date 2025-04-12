import { Component, Input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-actions',
  imports: [],
  templateUrl: './user-actions.component.html',
  styleUrl: './user-actions.component.scss'
})
export class UserActionsComponent {
  @Input() isOwn: boolean = false;

  constructor( private authService: AuthService) {}

  async logout() {
    await this.authService.logout();
  }
}
