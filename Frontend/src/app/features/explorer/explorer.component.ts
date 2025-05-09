import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { PostsComponent } from "../../shared/components/posts/posts.component";

@Component({
  selector: 'app-explorer',
  imports: [PostsComponent],
  templateUrl: './explorer.component.html',
  styleUrl: './explorer.component.scss'
})
export class ExplorerComponent implements AfterViewInit {
  private observer!: IntersectionObserver;
  public isLoading = false;

  @ViewChild('observer', { static: false }) observerElement!: ElementRef;
  @ViewChild(PostsComponent) postsComponent!: PostsComponent;

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.isLoading) {
        this.isLoading = true;
        this.onLoadMorePosts();
      }
    });

    if (this.observerElement) {
      this.observer.observe(this.observerElement.nativeElement);
    }
  }

  public onLoadMorePosts(): void {
    setTimeout(() => {
      this.postsComponent.loadPosts();
      this.isLoading = false;
      console.log('Más publicaciones cargadas');
    }, 2000);
  }
}
