import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = environment.apiUrl;
  private postsSubject = new BehaviorSubject<any>(null);
  posts$ = this.postsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPosts(userArticles = false) {
    const userId = localStorage.getItem('userId');
    if (userArticles) {
      this.http.get<any>(`${this.apiUrl}/posts/user/${userId}`, {withCredentials: true}).subscribe(
        (data) => {
          if (Array.isArray(data.posts)) {
            this.postsSubject.next(data.posts);
          } else {
            console.error("Error: La API no devolvió un array", data);
            this.postsSubject.next([]);
          }
        },
        (error) => {
          console.error("Error al obtener posts:", error);
          this.postsSubject.next([]);
        }
      );
    } else {
      this.http.get<any>(`${this.apiUrl}/posts/${userId}`, {withCredentials: true}).subscribe(
        (data) => {
          if (Array.isArray(data.posts)) {
            this.postsSubject.next(data.posts);
          } else {
            console.error("Error: La API no devolvió un array", data);
            this.postsSubject.next([]);
          }
        },
        (error) => {
          console.error("Error al obtener posts:", error);
          this.postsSubject.next([]);
        }
      );
    }
    return this.posts$;
  }

  toggleLike(postId: number) {
    const userId = localStorage.getItem('userId');
    return this.http.post<any>(`${this.apiUrl}/posts/like/${postId}`, { user_id: userId }, {withCredentials: true});
  }

  getComments(postId: number) {
    return this.http.get<any>(`${this.apiUrl}/posts/comments/${postId}`, {withCredentials: true});
  }

}
