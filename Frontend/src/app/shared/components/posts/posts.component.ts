import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PostService } from '../../../core/services/post.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-posts',
  imports: [CommonModule, RouterModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent implements OnChanges {
  @Input() isGrid: boolean = false;
  @Input() userArticles: boolean = false;
  @Input() userId: number | null = null;
  @Input() saved: boolean = false;
  @Output() noPosts = new EventEmitter<boolean>();
  liked = false; 
  isLoading = true;
  posts: any[] = [];  


  constructor(private postsService: PostService, private router: Router, private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && !changes['userId'].firstChange) {
      this.loadPosts(); 
    }
  }

  ngOnInit() {
    this.loadPosts();
  }

  ngOnDestroy() {
    this.userId = null;
  }

  toggleLike(post: any): void {
    this.postsService.toggleLike(post.id).subscribe({
      next: (updatedPost) => {
        post.liked = updatedPost.liked;
        post.likes_count = updatedPost.likes_count;
      },
      error: (err) => {
        console.error('Error al actualizar el like:', err);
      }
    });
  }

  toggleSave(post: any): void {
    this.postsService.toggleSave(post.id).subscribe({
      next: (updatedPost) => {
        post.saved = updatedPost.saved;
      },
      error: (err) => {
        console.error('Error al actualizar el guardado:', err);
      }
    });
  }

  goToComments(post: any): void {
    sessionStorage.setItem('postId', post.id.toString()); 
    this.router.navigate(['/comments']);
  }

  goToProfile(username: string): void {
    this.router.navigate(['/profile', username]);
  }

  private loadPosts() {
    this.postsService.getPosts(this.userArticles, this.userId, this.saved).subscribe((posts) => {
      
      if (posts.length === 0) {
        this.noPosts.emit(true); // Emitir que no hay posts
      } else {
        this.noPosts.emit(false);
        this.posts = posts; // Emitir que hay posts
        setTimeout(() => { this.isLoading = false; }, 2000);
      }
      console.log('Posts:', this.posts);
    });
    
  }

  savePost(post: any): void {

  }

}
