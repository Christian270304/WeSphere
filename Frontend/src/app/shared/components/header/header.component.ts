import { Component, HostListener } from '@angular/core';
import { HeaderStateService } from '../../../core/services/header-state.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  hideElements: boolean = false;
  dropdownOpen: boolean = false;
  user: any = {};

  constructor(private headerStateService: HeaderStateService, private userService: UserService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    this.headerStateService.hideElements$.subscribe((value) => {
      this.hideElements = value;
    });
    if (userId !== null) {
      const numericUserId = Number(userId);
      this.userService.getUser(numericUserId).subscribe((user) => {
        this.user = user;
      });
    } else {
      console.error('User ID is null');
    }
  }

  async logout() {
    await this.authService.logout();
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

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
