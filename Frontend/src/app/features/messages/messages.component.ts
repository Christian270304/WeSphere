import { Component } from '@angular/core';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-messages',
  imports: [],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {
  public user: any = {};

  constructor(private userService: UserService) {
    this.userService.getUser(1).subscribe((user) => {
      this.user = user;
    });
  }
}
