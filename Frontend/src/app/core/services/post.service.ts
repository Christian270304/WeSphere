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

  getPosts() {
    const userId = localStorage.getItem('userId');
    this.http.get<any>(`${this.apiUrl}/posts/${userId}`).subscribe(
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
