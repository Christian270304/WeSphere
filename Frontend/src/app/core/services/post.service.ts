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
    console.log("Datos: ", userArticles, userId, saved);
    if (userArticles) {
      console.log("Entro en userArticles");
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
      return this.posts$;
    } else if (saved) {
      console.log("Entro en saved");
      this.http.get<any>(`${this.apiUrl}/posts/savedposts`, {withCredentials: true}).subscribe(
        (data) => {
          this.postsSubject.next([]);
          console.log("Saved posts:", data);
          
          if (Array.isArray(data.posts)) {
            if (data.posts.length === 0) {
              console.log("No hay publicaciones guardadas");
              this.postsSubject.next([]); // Emitir un array vacío
            } else {
              this.postsSubject.next(data.posts); // Emitir las publicaciones
            }
          } else {
            console.error("Error: La API no devolvió un array", data);
            this.postsSubject.next([]); // Emitir un array vacío en caso de error
          }
          
        },
        (error) => {
          console.error("Error al obtener posts:", error);
          this.postsSubject.next([]);
        }
      );
      return this.posts$;
    } else {
      console.log("Entro en else");
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
      return this.posts$;
    }
    
  }

  savePost(post: any) {
    this.http.post<any>(`${this.apiUrl}/posts/`, post, {withCredentials: true}).subscribe();
  }

  toggleLike(postId: number) {
    return this.http.post<any>(`${this.apiUrl}/posts/like/${postId}`, {}, {withCredentials: true});
  }

  toggleSave(postId: number) {
    return this.http.post<any>(`${this.apiUrl}/posts/save/${postId}`, {}, {withCredentials: true}).pipe(
      tap(response => console.log('Respuesta del backend:', response)));
  }

  getComments(postId: number) {
    return this.http.get<any>(`${this.apiUrl}/posts/comments/${postId}`, {withCredentials: true});
  }

}
