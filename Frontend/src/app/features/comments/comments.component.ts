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
  public post: any = {};

  constructor(private postService: PostService) {}

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
    this.postService.getComments(postId).subscribe((response) => {
      this.post = response.Post; // Accede a la propiedad `Post` de la respuesta
      console.log('Post cargado:', this.post);
    });
  }
}
