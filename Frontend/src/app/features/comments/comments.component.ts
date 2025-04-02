import { Component } from '@angular/core';
import { PostService } from '../../core/services/post.service';
import { environment } from '../../../environments/environment';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-comments',
  imports: [PickerComponent, FormsModule],
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
      console.log('Post ID recibido:', this.postId);
      this.loadComments(this.postId);
    } else {
      console.error('No se recibió un postId');
    }
  }

  loadComments(postId: number): void {
    this.postService.getComments(postId).subscribe((response) => {
      this.post = response.Post; 
      console.log('Post cargado:', this.post);
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
      alert('No puedes enviar un comentario vacío.');
      return;
    }
    const user_id = localStorage.getItem('userId');
    this.http.post(`${this.apiUrl}/posts/comment/${this.postId}`, { user_id: user_id, content: commentText }).subscribe(
      (response) => {
        console.log('Comentario creado exitosamente:', response);
        inputComment.value = ''; 
        this.loadComments(this.postId!); 
      },
      (error) => {
        console.error('Error al crear el comentario:', error);
      }
    );
  }
  
  calcularDiferenciaDeTiempo(fecha: any) {
    const fechaActual = new Date();
    const fechaPost = new Date(fecha);
    const diferencia = fechaActual.getTime() - fechaPost.getTime();
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const semanas = Math.floor(dias / 7);
    const meses = Math.floor(semanas / 4);
    const años = Math.floor(meses / 12);

    if (años > 0) {
      return `hace ${años} año${años > 1 ? 's' : ''}`;
    } else if (meses > 0) {
      return `hace ${meses} mes${meses > 1 ? 'es' : ''}`;
    } else if (semanas > 0) {
      return `hace ${semanas} semana${semanas > 1 ? 's' : ''}`;
    } else if (dias > 0) {
      return `hace ${dias} día${dias > 1 ? 's' : ''}`;
    } else if (horas > 0) {
      return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
    } else if (minutos > 0) {
      return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    } else {
      return `hace ${segundos} segundo${segundos > 1 ? 's' : ''}`;
    }
  }
}
