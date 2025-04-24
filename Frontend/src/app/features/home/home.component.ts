import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { PostsComponent } from '../../shared/components/posts/posts.component';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HeaderStateService } from '../../core/services/header-state.service';
import { UserService } from '../../core/services/user.service';
import { SuggestionComponent } from '../../shared/components/suggestion/suggestion.component';

@Component({
  selector: 'app-home',
  imports: [PostsComponent, RouterModule, SuggestionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private apiUrl = environment.apiUrl
  isAuthenticated = false; 
  liked = false; 
  likeCount = 150; 
  selectedImage = '';
  public placeholderText = '';

  public user: any = {}; 

  constructor (private http: HttpClient, private headerStateService: HeaderStateService, private userService: UserService) {}

  

  ngOnInit() {
    this.headerStateService.setHideElements(false);
 
    this.userService.getUser().subscribe((user) => {
      this.user = user;
      this.placeholderText = `¿Qué estás pensando, ${user.username}?`;
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const divVideo = document.querySelector('div.video-container') as HTMLDivElement;
    const previewImage = document.querySelector('img[class="post-image-preview"]') as HTMLImageElement;
    const previewVideo = document.querySelector('video[class="post-video-preview"]') as HTMLVideoElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('Archivo seleccionado:', file);

      if (file.type.startsWith('image/')) {
        previewImage.style.display = 'block';
        previewVideo.style.display = 'none'; 
        const reader = new FileReader();
        reader.onload = (e: any) => {
          
          previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        divVideo.style.display = 'block';
        previewImage.style.display = 'none'; 
        previewVideo.style.display = 'block';
        
        
        // Obtener elementos del DOM
const video = document.getElementById("video") as HTMLVideoElement;
const playPauseBtn = document.getElementById("playPauseBtn") as HTMLButtonElement;
const progressBar = document.getElementById("progressBar") as HTMLDivElement;
const progress = document.getElementById("progress") as HTMLDivElement;
const volume = document.getElementById("volume") as HTMLInputElement;
const fullscreenBtn = document.getElementById("fullscreenBtn") as HTMLButtonElement;

// Función para alternar Play/Pause
function togglePlayPause(): void {
    if (video.paused) {
        video.play();
        playPauseBtn.textContent = "⏸";
    } else {
        video.pause();
        playPauseBtn.textContent = "▶️";
    }
}

// Actualizar barra de progreso
function updateProgress(): void {
    const progressPercent = (video.currentTime / video.duration) * 100;
    progress.style.width = `${progressPercent}%`;
}

// Adelantar video al hacer clic en la barra de progreso
function setProgress(event: MouseEvent): void {
    const newTime = (event.offsetX / progressBar.clientWidth) * video.duration;
    video.currentTime = newTime;
}

// Control de volumen
function setVolume(): void {
    video.volume = parseFloat(volume.value);
}

// Pantalla completa
function toggleFullScreen(): void {
    if (!document.fullscreenElement) {
        video.requestFullscreen().catch(err => console.error(err));
    } else {
        document.exitFullscreen();
    }
}

// Event Listeners
playPauseBtn.addEventListener("click", togglePlayPause);
video.addEventListener("timeupdate", updateProgress);
progressBar.addEventListener("click", setProgress);
volume.addEventListener("input", setVolume);
fullscreenBtn.addEventListener("click", toggleFullScreen);




        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          
          if (previewVideo) {
            previewVideo.src = e.target.result;
          }
        };
        reader.readAsDataURL(file);
        
      }
    }
  }

  createPost(): void {
    const inputElement = document.querySelector('div.description input') as HTMLInputElement;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput.files?.[0]; 
    let description = inputElement.value.trim();

    if ((!description || description == this.placeholderText) && !file) { 
      alert('No puedes enviar un post vacío.');
      return;
    }

    if (description === this.placeholderText) {
     description = '';
    }
    alert(`Post creado exitosamente ${description} ${file}`);

  const formData = new FormData();
  formData.append('description', description);
  if (file) {
    if (file.type.startsWith('image/')) {
      formData.append('image', file); 
    } else if (file.type.startsWith('video/')) {
      formData.append('video', file); 
    }
  }


  this.http.post(`${this.apiUrl}/posts/create`, formData, {withCredentials: true}).subscribe(
    (response) => {
      console.log('Post creado exitosamente:', response);
      inputElement.innerText = this.placeholderText; 
      if (fileInput) {
        fileInput.value = ''; 
      }
      const previewImage = document.querySelector('img[class="post-image-preview"]') as HTMLImageElement;
      if (previewImage) {
        previewImage.src = '';
      }
      const previewVideo = document.querySelector('video[class="post-video-preview"]') as HTMLVideoElement;
      const divVideo = document.querySelector('div.video-container') as HTMLDivElement;
      if (previewVideo) {
        previewVideo.src = '';
        previewVideo.style.display = 'none';
      }
      if (divVideo) {
        divVideo.style.display = 'none';
      }
    },
    (error) => {
      console.error('Error al crear el post:', error);
    }
  );
  }

  clearPlaceholder(): void {
    const inputElement = document.querySelector('div.create-post-input') as HTMLDivElement;
    if (inputElement.innerText === this.placeholderText) {
      inputElement.innerText = '';
    }
  }

  restorePlaceholder(): void {
    const inputElement = document.querySelector('div.create-post-input') as HTMLDivElement;
    if (inputElement.innerText.trim() === '') {
      inputElement.innerText = this.placeholderText; 
    }
  }

  // toggleLike() {
  //   this.liked = !this.liked; // Cambia entre like y no like
  //   this.likeCount += this.liked ? 1 : -1; // Suma o resta un like
  // }

  
}
