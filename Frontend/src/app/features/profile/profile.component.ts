import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { UserStatsComponent } from '../../shared/components/user-stats/user-stats.component';
import { UserActionsComponent } from '../../shared/components/user-actions/user-actions.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  public user: any = {};
  public userId: number | null = null;
  public isOwnProfile: boolean = false;
  public noExists: boolean = false;
  public username: string | null = null;

  constructor(private route: ActivatedRoute, private headerStateService: HeaderStateService, private userService: UserService,  private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.headerStateService.setHideElements(true);

    this.route.paramMap.subscribe(params => {
      const usernameFromUrl = params.get('username');
      this.userId = null;  

      if (!usernameFromUrl) {
        this.userService.getUser().subscribe(user => {
          this.user = user;
          this.userId = user.id;
          this.isOwnProfile = true;
          this.noExists = false; 
          this.cdr.detectChanges(); 
        });
      } else {
        this.userService.getUserByUsername(usernameFromUrl).subscribe((profileUser) => {
          if (profileUser) {
            this.user = profileUser.user;
            this.userId = profileUser.user.id;
            this.isOwnProfile = profileUser.current_user_id === profileUser.user.id;
            this.noExists = false; 
            this.cdr.detectChanges(); 
          } else {
            this.noExists = true;  
            this.cdr.detectChanges(); 
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.userId = null;
  }
  
  
}
