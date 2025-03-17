import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-posts',
  imports: [CommonModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent {
  private apiUrl = environment.apiUrl;
  liked = false; 

  public posts: any[] = [];  


  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getPosts();
  }

  // conseguir la id del usuario
  getUserId() {
    return localStorage.getItem('userId');
  }

  // fetch para conseguir los posts
  getPosts() {
    const userId = this.getUserId();
    this.http.get<any>(`${this.apiUrl}/posts/${userId}`).subscribe(
      (data) => {
        if (Array.isArray(data.posts)) {
          this.posts = data.posts; // ✅ Acceder a 'posts' dentro del objeto
        } else {
          console.error("Error: La API no devolvió un array", data);
          this.posts = [];
        }
      },
      (error) => {
        console.error("Error al obtener posts:", error);
        this.posts = [];
      }
    );
  }
  
  

  toggleLike() {
    this.liked = !this.liked; // Cambia entre like y no like
  }

  calculateTimeDifference(date: string) {
    const currentDate = new Date();
    const postDate = new Date(date);
    const difference = currentDate.getTime() - postDate.getTime();
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(weeks / 4);
    const years = Math.floor(months / 12);

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (weeks > 0) {
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
  }

}
