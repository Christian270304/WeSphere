import { Component } from '@angular/core';
import { PostsComponent } from "../../shared/components/posts/posts.component";

@Component({
  selector: 'app-explorer',
  imports: [PostsComponent],
  templateUrl: './explorer.component.html',
  styleUrl: './explorer.component.scss'
})
export class ExplorerComponent {

}
