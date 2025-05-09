import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-actions',
  imports: [],
  templateUrl: './user-actions.component.html',
  styleUrl: './user-actions.component.scss'
})
export class UserActionsComponent {
  @Output() editProfile: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() save: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() userId: number | null = null;
  @Input() isOwn: boolean = false;
  @Input() cancelarEdicion: boolean = false;
  isEditing: boolean = false;
  isFollowing: boolean = false;

  constructor( private authService: AuthService, private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    if (!this.isOwn) {
      this.userService.getFollowStatus(this.userId!).subscribe({
        next: (response) => {
          this.isFollowing = response.isFollowing;
        },
        error: (err) => {
          console.error('Error al obtener el estado de seguimiento:', err);
        }
      });
    }
  }

  ngOnDestroy() {
    this.isFollowing = false;
    this.isEditing = false;
  }

  ngOnChanges() {
    if (this.cancelarEdicion) {
      this.isEditing = false;
      this.cancelarEdicion = false;
    }
  }

  async logout() {
    await this.authService.logout();
  }

  sendMessage(): void {
    if (this.userId) {
      this.router.navigate(['/messages'], { queryParams: { userId: this.userId } });
    }
  }

  toggleEditProfile(): void {
    if (!this.isEditing) {
      this.isEditing = !this.isEditing;
      this.editProfile.emit(this.isEditing);
    } else  {
      this.editProfile.emit(false)
    }
     
  }

  saveChanges(): void {
    this.isEditing = false; // Cambiar el estado
    // this.editProfile.emit(this.isEditing);
    this.save.emit(true); // Emitir el evento de guardado al padre
  }

  toggleFollow(): void {
    this.userService.toggleFollow(this.userId!).subscribe({
      next: (response) => {
        this.isFollowing = response.following; 
      },
      error: (err) => {
        console.error('Error al seguir/dejar de seguir:', err);
      }
    });
  }
}
