import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserStatsComponent } from '../../shared/components/user-stats/user-stats.component';
import { UserActionsComponent } from '../../shared/components/user-actions/user-actions.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';
import { PostsComponent } from '../../shared/components/posts/posts.component';
import { HeaderStateService } from '../../core/services/header-state.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, UserStatsComponent, UserActionsComponent, RouterModule, PostsComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private apiUrl = environment.apiUrl;
  public user: any = {};

  constructor(private http: HttpClient, private headerStateService: HeaderStateService, private userService: UserService) {}

  ngOnInit() {
   
    this.headerStateService.setHideElements(true);
    
    this.userService.getUser().subscribe((user) => {
      this.user = user;
    });
    
  }

}
