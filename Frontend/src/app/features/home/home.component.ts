import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { PostsComponent } from '../../shared/components/posts/posts.component';

@Component({
  selector: 'app-home',
  imports: [PostsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isAuthenticated = false; // Estado de autenticación
  liked = false; // Estado del like
  likeCount = 150; // Número inicial de likes

  constructor (private authService: AuthService, private router: Router) {}

  async logout() {
    await this.authService.logout();
    this.router.navigate(['']);
  }

  toggleLike() {
    this.liked = !this.liked; // Cambia entre like y no like
    this.likeCount += this.liked ? 1 : -1; // Suma o resta un like
  }

  
}
