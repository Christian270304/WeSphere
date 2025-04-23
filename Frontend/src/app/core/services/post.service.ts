import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = environment.apiUrl;
  private postsSubject = new BehaviorSubject<any>(null);
  posts$ = this.postsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPosts(userArticles = false, userId: number | null = null, saved = false) {
    if (userArticles) {
      this.http.get<any>(`${this.apiUrl}/posts/user/${userId}`, {withCredentials: true}).subscribe(
        (data) => {
          console.log("Posts obtenidos:", data);
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
    } else if (saved) {
      this.http.get<any>(`${this.apiUrl}/posts/savedposts`, {withCredentials: true}).subscribe(
        (data) => {
          console.log("Saved posts:", data);
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
      this.http.get<any>(`${this.apiUrl}/posts/`, {withCredentials: true}).subscribe(
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

  savePost(post: any) {
    this.http.post<any>(`${this.apiUrl}/posts/`, post, {withCredentials: true}).subscribe();
  }

  toggleLike(postId: number) {
    return this.http.post<any>(`${this.apiUrl}/posts/like/${postId}`, {withCredentials: true});
  }

  toggleSave(postId: number) {
    return this.http.post<any>(`${this.apiUrl}/posts/save/${postId}`, {withCredentials: true}).pipe(
      tap(response => console.log('Respuesta del backend:', response)));
  }

  getComments(postId: number) {
    return this.http.get<any>(`${this.apiUrl}/posts/comments/${postId}`, {withCredentials: true});
  }

}
