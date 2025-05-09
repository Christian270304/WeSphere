import { Component } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  public activeSection: string = 'notifications';
  public theme: string; 
  public isPrivate: boolean = false;

  constructor(private themeService: ThemeService, private userService: UserService, private authService: AuthService) {
    this.theme = this.themeService.getTheme();
  }

  ngOnInit(): void {
    this.userService.getStatusProfile().subscribe((res) => {
      if (res.profileStatus.is_private === true) {
        this.isPrivate = true;
      }
    });
  }

  togglePrivate(): void {
    this.isPrivate = !this.isPrivate;
    this.userService.setStatusProfile(this.isPrivate).subscribe((res) => {
      console.log('Perfil actualizado:', res);
    }, error => {
      console.error('Error al actualizar el perfil:', error);
    });
  }

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.themeService.setTheme(this.theme);
    this.setTheme(this.theme);  
  }

  private setTheme(theme: string): void {
    if (theme === 'dark') {
      document.body.classList.remove('dark-mode');
      
    } else {
      document.body.classList.add('dark-mode');
      
    }
  }

  deleteAccount() {
    this.authService.deleteAccount().subscribe((res) => {
      console.log('Compte eliminat:', res);
    }, error => {
      console.error('Error al eliminar el compte:', error);
    });
  }

  scrollToSection(sectionId: string): void {
    
    const section = document.querySelector(`#${sectionId}`) as HTMLElement;
    if (section) {
      const offset = 110;
      const sectionPosition = section.offsetTop - offset;
      window.scrollTo({
        top: sectionPosition,
        behavior: 'smooth'
      });

      section.classList.add('highlight');
      setTimeout(() => {
        section.classList.remove('highlight');
      }, 2000); 

      this.activeSection = sectionId; 
    }
  }
}
