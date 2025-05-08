import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = environment.apiUrl;
  private postsSubject = new BehaviorSubject<any>(null);
  private postsUserSubject = new BehaviorSubject<any>(null);
  private postsSavedSubject = new BehaviorSubject<any>(null);
  private postsExplorerSubject = new BehaviorSubject<any>(null);
  posts$ = this.postsSubject.asObservable();
  postsUser$ = this.postsUserSubject.asObservable();
  postsSaved$ = this.postsSavedSubject.asObservable();
  postsExplorer$ = this.postsExplorerSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPosts( limit: number = 20, offset: number = 0) {
      this.http.get<any>(`${this.apiUrl}/posts/recomendado?limit=${limit}&offset=${offset}`, {withCredentials: true}).pipe(
        tap((data) => {
          if (Array.isArray(data.posts)) {
            this.postsSubject.next(data.posts);
          } else {
            this.postsSubject.next([]);
          }
        }),
        catchError((error) => {
          console.error("Error al obtener posts:", error);
          this.postsSubject.next([]);
          return of(null); 
        })
      ).subscribe();
      
      return this.posts$;
  }

  getPostsExplorer( limit: number = 20, offset: number = 0) {
    this.http.get<any>(`${this.apiUrl}/posts/explorar?limit=${limit}&offset=${offset}`, {withCredentials: true}).pipe(  
        
        tap((data) => {
          if (Array.isArray(data.posts)) {
            this.postsExplorerSubject.next(data.posts);
          } else {
            this.postsExplorerSubject.next([]);
          }
        }),
        catchError((error) => {
          console.error("Error al obtener posts:", error);
          this.postsExplorerSubject.next([]);
          return of(null); 
        })
      ).subscribe();
      return this.postsExplorer$;
    }

  getPostsByUserId(userId: number) {
    this.http.get<any>(`${this.apiUrl}/posts/user/${userId}`, { withCredentials: true }).pipe(
      tap((data) => {
        if (Array.isArray(data.posts)) {
          this.postsUserSubject.next(data.posts);
        } else {
          this.postsUserSubject.next([]);
        }
      }),
      catchError((error) => {
        console.error("Error al obtener posts:", error);
        this.postsUserSubject.next([]);
        return of(null); 
      })
    ).subscribe(); 
  
    return this.postsUser$;
  }

  getSavedPosts() {
    this.http.get<any>(`${this.apiUrl}/posts/savedposts`, {withCredentials: true}).pipe(
      tap((data) => {
        if (Array.isArray(data.posts)) {
          if (data.posts.length === 0) {
            this.postsSavedSubject.next([]); 
          } else {
            this.postsSavedSubject.next(data.posts); 
          }
        } else {
          console.error("Error: La API no devolvió un array", data);
          this.postsSavedSubject.next([]); 
        }
      }),
      catchError((error) => {
        console.error("Error al obtener posts:", error);
        this.postsSavedSubject.next([]);
        return of(null);
      })
    ).subscribe();
    
    return this.postsSaved$;
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
