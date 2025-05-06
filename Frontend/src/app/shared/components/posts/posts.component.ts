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
  @Input() cargarMas: boolean = false;
  @Output() noPosts = new EventEmitter<boolean>();
  liked = false; 
  isLoading = true;
  posts: any[] = [];  

  loading = false;
  limit = 10;
  offset = 0;


  constructor(private postsService: PostService, private router: Router, private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && !changes['userId'].firstChange) {
      this.loadPosts(); 
    }
    if (changes['cargarMas'] && !changes['cargarMas'].firstChange) {
      if (changes['cargarMas'].currentValue === true) {
        this.loadPosts(); 
      } 
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

  public loadPosts(): void {
    this.postsService.getPosts(this.userArticles, this.userId, this.saved, this.limit, this.offset).subscribe({
      next: (posts) => {
        console.log('Posts obtenidos:', posts);

        if (posts.length === 0 ) {
          console.log('No hay publicaciones');
          this.noPosts.emit(true); 
        } else {
          console.log('Hay publicaciones');
          this.noPosts.emit(false);

          this.addUniquePosts(posts); 
          this.offset += this.limit; 
          setTimeout(() => {
            this.isLoading = false; 
          }, 2000);
        }
      },
      error: (err) => {
        console.error('Error al cargar publicaciones:', err);
        this.loading = false;
      }
    });
  }

  // onScroll(): void {
  //   const container = document.querySelector('.post-container');
  //   if (container) {
  //     console.log('Scroll event detected!');
  //     const scrollTop = container.scrollTop;
  //     const scrollHeight = container.scrollHeight;
  //     const clientHeight = container.clientHeight;

  //     if (scrollTop + clientHeight >= scrollHeight - 1 ) { // Ajusta el valor según sea necesario
  //       console.log('Cargando más publicaciones...');
        
  //     }
  //     // const { scrollTop, scrollHeight, clientHeight } = container;
  //     // if (scrollTop + clientHeight >= scrollHeight && !this.loading) {
  //     //   console.log('Cargando más publicaciones...');
  //     //   this.loadPosts(); // Cargar más publicaciones
  //     // }
  //   }
  // }

  savePost(post: any): void {

  }

  private addUniquePosts(newPosts: any[]): void {
    const existingPostIds = new Set(this.posts.map(post => post.id));
  
    const uniquePosts = newPosts.filter((post, index, self) => {
      if (!post.id) {
        console.warn('Post sin ID detectado y excluido:', post);
        return false; 
      }
  
      const isDuplicateInNewPosts = self.findIndex(p => p.id === post.id) !== index;
      if (isDuplicateInNewPosts) {
        return false;
      }
  
      return !existingPostIds.has(post.id);
    });
  
    this.posts = [...this.posts, ...uniquePosts];
  }

}
