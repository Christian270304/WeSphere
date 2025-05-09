import { Component, HostListener } from '@angular/core';
import { HeaderStateService } from '../../../core/services/header-state.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  notifications: any[] = [];
  hideElements: boolean = false;
  dropdownOpen: boolean = false;
  user: any = {};
  theme: string = 'light';
  unreadCount: number = 0;
  showDropdown: boolean = false;
  isMobile: boolean = false;

  constructor(
    private headerStateService: HeaderStateService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.isMobile = window.innerWidth <= 768;

    this.listenForIncomingNotifications();

    this.themeService.theme$.subscribe((theme) => {
      this.theme = theme;
    });

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
      this.notifications.unshift(notification.notification);
      this.unreadCount++;
    });
  }

  markAsRead(notification: any): void {
    notification.isRead = true;
    this.unreadCount--;
  }

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.themeService.setTheme(this.theme);
    this.setTheme(this.theme);
  }

  private setTheme(theme: string): void {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleDropdownNot() {
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!(event.target as HTMLElement).closest('.user-profile')) {
      this.dropdownOpen = false;
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
