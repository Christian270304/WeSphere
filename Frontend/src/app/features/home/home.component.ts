import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  liked = false; // Estado del like
  likeCount = 150; // Número inicial de likes

  toggleLike() {
    this.liked = !this.liked; // Cambia entre like y no like
    this.likeCount += this.liked ? 1 : -1; // Suma o resta un like
  }
}
