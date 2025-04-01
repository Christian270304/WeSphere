import { Component } from '@angular/core';
import { PostService } from '../../core/services/post.service';

@Component({
  selector: 'app-comments',
  imports: [],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss'
})
export class CommentsComponent {
  postId: number | null = null;

  constructor(private postDataService: PostService) {}

  ngOnInit(): void {
    const postId = sessionStorage.getItem('postId');
    this.postId = postId ? Number(postId) : null;
  
    if (this.postId) {
      console.log('Post ID recibido:', this.postId);
      this.loadComments(this.postId);
    } else {
      console.error('No se recibió un postId');
    }
  }

  loadComments(postId: number): void {
    console.log(`Cargando comentarios para el post con ID: ${postId}`);
  }
}
