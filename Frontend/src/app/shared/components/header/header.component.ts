import { Component, HostListener } from '@angular/core';
import { HeaderStateService } from '../../../core/services/header-state.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  notifications: any[] = [];
  hideElements: boolean = false;
  dropdownOpen: boolean = false;
  user: any = {};
  theme: string = 'light'; 
  unreadCount: number = 0;
  showDropdown = false;
  isMobile: boolean = false;

  // Cambiar el tema
  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(this.theme);
    // Guardar el tema en localStorage
    localStorage.setItem('theme', this.theme);
  }

  // Aplicar el tema al body
  private setTheme(theme: string): void {
    if (theme === 'dark') {
      document.body.classList.remove('dark-mode');
    } else {
      document.body.classList.add('dark-mode');
    }
  }


  constructor(
    private headerStateService: HeaderStateService, 
    private userService: UserService, 
    private authService: AuthService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const isMobile = window.innerWidth <= 768; 
    if (isMobile) {
      this.isMobile = true;
    }
    this.listenForIncomingNotifications();
    // Cargar el tema guardado desde localStorage
    this.theme = localStorage.getItem('theme') || 'light';
    this.setTheme(this.theme);
    
    this.headerStateService.hideElements$.subscribe((value) => {
      this.hideElements = value;
    });
    
    this.userService.getUser().subscribe((user) => {
      this.user = user;
    });
    
  }

  ngOnDestroy() {
    this.notificationService.disconnect(this.user.id); 
  }

  async logout() {
    await this.authService.logout();
  }

  listenForIncomingNotifications() {
    this.notificationService.onNotification((notification) => {
      console.log('Nueva notificación recibida:', notification);
      this.notifications.unshift(notification.notification);
      this.unreadCount++;
    });
  }

  toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
      if (!(event.target as HTMLElement).closest('.user-profile')) {
          this.dropdownOpen = false;
      }
  }

  markAsRead(notification: any): void {
    notification.isRead = true;
    this.unreadCount--;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  toggleDropdownNot() {
  this.showDropdown = !this.showDropdown;
}

}
