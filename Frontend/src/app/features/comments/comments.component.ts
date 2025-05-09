import { Component } from '@angular/core';
import { PostService } from '../../core/services/post.service';
import { environment } from '../../../environments/environment';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comments',
  imports: [PickerComponent, FormsModule, CommonModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss'
})
export class CommentsComponent {
  private apiUrl = environment.apiUrl
  postId: number | null = null;
  public post: any = {};
  public showEmojiPicker: boolean = false;
  public commentText: string = '';

  constructor(private postService: PostService, private http: HttpClient) {}

  ngOnInit(): void {
    const postId = sessionStorage.getItem('postId');
    this.postId = postId ? Number(postId) : null;
  
    if (this.postId) {
      this.loadComments(this.postId);
    } else {
      console.error('No se recibió un postId');
    }
  }

  loadComments(postId: number): void {
    this.postService.getComments(postId).subscribe((response) => {
      this.post = response.Post; 
    });
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }


  addEmoji(event: any): void {
    this.commentText += event.emoji.native;
  }

  createComment(): void {
    const inputComment = document.querySelector('input[name="comment"]') as HTMLInputElement;
    let commentText = inputComment.value.trim(); 
    if (!commentText) {
      return;
    }
    this.http.post(`${this.apiUrl}/posts/comment/${this.postId}`, { content: commentText }, {withCredentials: true}).subscribe(
      (response) => {
        inputComment.value = ''; 
        this.loadComments(this.postId!); 
      },
      (error) => {
        console.error('Error al crear el comentario:', error);
      }
    );
  }
  
}
