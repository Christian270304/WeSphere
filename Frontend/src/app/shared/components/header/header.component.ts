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
  theme: string = 'light'; // Tema por defecto

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
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }


  constructor(private headerStateService: HeaderStateService, private userService: UserService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
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
