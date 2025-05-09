import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HeaderStateService } from '../../core/services/header-state.service';
import { UserService } from '../../core/services/user.service';
import { ErrorService } from '../../core/services/error.service';
import { PostsComponent } from '../../shared/components/posts/posts.component';
import { SuggestionComponent } from '../../shared/components/suggestion/suggestion.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-home',
  imports: [PostsComponent, RouterModule, SuggestionComponent, NavbarComponent, ErrorMessageComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private apiUrl = environment.apiUrl;
  public isAuthenticated = false;
  public liked = false;
  public likeCount = 150;
  public selectedImage = '';
  public cargarMasPosts = false;
  public placeholderText = '';
  public isLoading = false;
  public message = '';
  public user: any = {};
  private observer!: IntersectionObserver;

  @ViewChild('observer', { static: false }) observerElement!: ElementRef;
  @ViewChild(PostsComponent) postsComponent!: PostsComponent;

  constructor(
    private http: HttpClient,
    private headerStateService: HeaderStateService,
    private userService: UserService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.headerStateService.setHideElements(false);
    this.loadUserData();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) this.observer.disconnect();
  }

  private loadUserData(): void {
    this.userService.getUser().subscribe((user) => {
      this.user = user;
      this.placeholderText = `Què estàs pensant, ${user.username}?`;
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.handleFilePreview(file);
    }
  }

  private handleFilePreview(file: File): void {
    const previewImage = document.querySelector('img.post-image-preview') as HTMLImageElement;
    const previewVideo = document.querySelector('video.post-video-preview') as HTMLVideoElement;
    const divVideo = document.querySelector('div.video-container') as HTMLDivElement;

    if (file.type.startsWith('image/')) {
      this.displayImagePreview(file, previewImage, previewVideo, divVideo);
    } else if (file.type.startsWith('video/')) {
      this.displayVideoPreview(file, previewImage, previewVideo, divVideo);
    }
  }

  private displayImagePreview(file: File, previewImage: HTMLImageElement, previewVideo: HTMLVideoElement, divVideo: HTMLDivElement): void {
    previewImage.style.display = 'block';
    previewVideo.style.display = 'none';
    divVideo.style.display = 'none';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private displayVideoPreview(file: File, previewImage: HTMLImageElement, previewVideo: HTMLVideoElement, divVideo: HTMLDivElement): void {
    previewImage.style.display = 'none';
    previewVideo.style.display = 'block';
    divVideo.style.display = 'block';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      previewVideo.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  public createPost(): void {
    const inputElement = document.querySelector('div.description input') as HTMLInputElement;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput.files?.[0];
    let description = inputElement.value.trim();

    if ((!description || description === this.placeholderText) && !file) {
      this.errorService.setError('No es pot crear un post buit!');
      return;
    }

    if (description === this.placeholderText) {
      description = '';
    }

    const formData = this.preparePostFormData(description, file);
    this.submitPost(formData, inputElement, fileInput);
  }

  private preparePostFormData(description: string, file?: File): FormData {
    const formData = new FormData();
    formData.append('description', description);
    if (file) {
      if (file.type.startsWith('image/')) {
        formData.append('image', file);
      } else if (file.type.startsWith('video/')) {
        formData.append('video', file);
      }
    }
    return formData;
  }

  private submitPost(formData: FormData, inputElement: HTMLInputElement, fileInput: HTMLInputElement): void {
    this.http.post(`${this.apiUrl}/posts/create`, formData, { withCredentials: true }).subscribe(
      () => {
        this.resetPostForm(inputElement, fileInput);
        console.log('Post creado exitosamente');
      },
      (error) => {
        console.error('Error al crear el post:', error);
      }
    );
  }

  private resetPostForm(inputElement: HTMLInputElement, fileInput: HTMLInputElement): void {
    inputElement.value = '';
    fileInput.value = '';

    const previewImage = document.querySelector('img.post-image-preview') as HTMLImageElement;
    const previewVideo = document.querySelector('video.post-video-preview') as HTMLVideoElement;
    const divVideo = document.querySelector('div.video-container') as HTMLDivElement;

    if (previewImage) previewImage.src = '';
    if (previewVideo) {
      previewVideo.src = '';
      previewVideo.style.display = 'none';
    }
    if (divVideo) divVideo.style.display = 'none';
  }

  public clearPlaceholder(): void {
    const inputElement = document.querySelector('div.create-post-input') as HTMLDivElement;
    if (inputElement.innerText === this.placeholderText) {
      inputElement.innerText = '';
    }
  }

  public restorePlaceholder(): void {
    const inputElement = document.querySelector('div.create-post-input') as HTMLDivElement;
    if (inputElement.innerText.trim() === '') {
      inputElement.innerText = this.placeholderText;
    }
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
