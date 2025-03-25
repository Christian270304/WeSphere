import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PostService } from '../../../core/services/post.service';

@Component({
  selector: 'app-posts',
  imports: [CommonModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent {
  @Input() isGrid: boolean = false;
  @Input() userArticles: boolean = false;
  liked = false; 
  isLoading = true;
  posts: any[] = [];  


  constructor(private http: HttpClient, private postsService: PostService) {}

  ngOnInit() {
    // Cargar los posts
    this.postsService.getPosts(this.userArticles).subscribe((posts) => { this.posts = posts; });
    // Hacer carga falsa para cargar los posts
    setTimeout(() => { this.isLoading = false; }, 2000);
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
