import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostsComponent } from '../../shared/components/posts/posts.component';

@Component({
  selector: 'app-saved-posts',
  imports: [RouterModule, PostsComponent],
  templateUrl: './saved-posts.component.html',
  styleUrl: './saved-posts.component.scss'
})
export class SavedPostsComponent {
  noSavedPosts: boolean = false; 

  handleNoPosts(event: boolean): void {
    this.noSavedPosts = event; 
    console.log("No hay publicaciones guardadas: ", this.noSavedPosts);
  }
}
