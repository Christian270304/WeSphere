import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PostService } from '../../../core/services/post.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posts',
  imports: [CommonModule, RouterModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent {
  @Input() isGrid: boolean = false;
  @Input() userArticles: boolean = false;
  liked = false; 
  isLoading = true;
  posts: any[] = [];  


  constructor(private http: HttpClient, private postsService: PostService, private router: Router) {}

  ngOnInit() {
    // Cargar los posts
    this.postsService.getPosts(this.userArticles).subscribe((posts) => { this.posts = posts; });
    // Hacer carga falsa para cargar los posts
    setTimeout(() => { this.isLoading = false; }, 2000);
  }

  toggleLike(post: any): void {
    // Llamar al backend para alternar el estado de "like"
    this.postsService.toggleLike(post.id).subscribe({
      next: (updatedPost) => {
        // Actualizar el estado del post con los datos del backend
        post.liked = updatedPost.liked;
        post.likes_count = updatedPost.likes_count;
      },
      error: (err) => {
        console.error('Error al actualizar el like:', err);
      }
    });
  }

  goToComments(post: any): void {
    sessionStorage.setItem('postId', post.id.toString()); 
    this.router.navigate(['/comments']);
  }

}
