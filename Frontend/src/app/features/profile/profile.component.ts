import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Output } from '@angular/core';
import { UserStatsComponent } from '../../shared/components/user-stats/user-stats.component';
import { UserActionsComponent } from '../../shared/components/user-actions/user-actions.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostsComponent } from '../../shared/components/posts/posts.component';
import { HeaderStateService } from '../../core/services/header-state.service';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { FriendsComponent } from '../../shared/components/friends/friends.component';
import { urlencoded } from 'express';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, UserStatsComponent, UserActionsComponent, RouterModule, PostsComponent, FormsModule, FriendsComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  public editandoPerfil: boolean = false;

  public user: any = {};
  public userId: number | null = null;
  public isOwnProfile: boolean = false;
  public noExists: boolean = false;
  public username: string | null = null;
  public mostrarConfirmacion = false;

  public cancelar: boolean = false;

  public originalUser: any;
  noPosts: boolean = false; 

  
  cambiosRealizados: boolean = false;

  // Propiedades temporales para los datos editados
  datosEditados = {
    username: '',
    bio: '',
    profileImage: null as  File | null,
    bannerImage: null as File | null 
  };

  constructor(private route: ActivatedRoute, private headerStateService: HeaderStateService, private userService: UserService,  private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.headerStateService.setHideElements(true);

    this.loadProfile();
  }

  ngOnDestroy() {
    this.userId = null;
  }

private loadProfile() {
  this.route.paramMap.subscribe(params => {
    const usernameFromUrl = params.get('username');
    this.userId = null;  

    if (!usernameFromUrl) {
      this.userService.getUser().subscribe(user => {
        if (user) {
          this.originalUser = structuredClone(user); 
          this.user = user;
          this.userId = user.id;
          this.isOwnProfile = true;
          this.noExists = false;
        } else {
          this.noExists = true;  
        }
      });
    } else {
      this.userService.getUserByUsername(usernameFromUrl).subscribe((profileUser) => {
        if (profileUser) {
          

          this.user = profileUser.user;
          this.userId = profileUser.user.id;
          this.isOwnProfile = profileUser.current_user_id === profileUser.user.id;
          this.noExists = false; 
          this.cdr.detectChanges();
          console.log(this.user); 
        } else {
          this.noExists = true;  
          this.cdr.detectChanges(); 
        }
      });
    }
  });
}

  handleNoPosts(event: boolean): void {
    this.noPosts = event; 
  }


public editableUser: any = {
  username: '',
  bio: '',
  profileImage: 0,
  bannerImage: 0
};

public handleEditProfile(event: boolean) {
  console.log(event);
  if (event) {
    this.editandoPerfil = true;
    this.editableUser = {
      username: this.user.username,
      bio: this.user.bio,
      profileImage: { url: this.user.profileImage?.url || '' },
      bannerImage: { url: this.user.bannerImage?.url || '' }
    };
  } else {
    this.editableUser = {
      username: this.user.username,
      bio: this.user.bio,
      profileImage: { url: this.user.profileImage?.url || ''},
      bannerImage: { url: this.user.bannerImage?.url || ''}
    };
    // Capturar los nuevos valores de los inputs
    const newUsername = document.querySelector('div.edit-username') as HTMLDivElement;
    const username = newUsername.innerText;
    if (this.editableUser.username === username) {
      this.editandoPerfil = false;
      

        this.cancelar = true;
        setTimeout(() => {
          this.cancelar = false;
        }, 100);
      
    } else if (this.editableUser.username != username) {
      this.mostrarConfirmacion = true;
    }
   
  }
}

public handleSave(event: boolean) {
  this.editandoPerfil = false;
  if (this.hayCambios()) {
    const formData = new FormData();
    formData.append('username', this.datosEditados.username);
    formData.append('bio', this.datosEditados.bio);
    if (this.datosEditados.profileImage) {
      formData.append('profileImage', this.datosEditados.profileImage);
    }
    if (this.datosEditados.bannerImage) {
      formData.append('bannerImage', this.datosEditados.bannerImage);
    }
  
    this.userService.updateUser(formData).subscribe({
      next: (response) => {
        window.location.reload();
      },
      error: (err) => {
        console.error('Error al guardar cambios:', err);
      }
    });
  }
}


seleccionarNuevaImagen(tipo: 'banner' | 'profile') {
  const input = document.querySelector(`#image`) as HTMLInputElement;
  if (input) {
    input.click();
  }
}


confirmarCancelar() {
  const username = document.querySelector('div.edit-username') as HTMLDivElement;
  username.innerHTML = this.editableUser.username;
  this.mostrarConfirmacion = false;
  this.editandoPerfil = false;
  this.cancelar = true;

  setTimeout(() => {
    this.cancelar = false;
  }, 100);
  
  // this.user = structuredClone(this.originalUser);
  // this.editandoPerfil = false;
  // this.mostrarConfirmacion = false;
}


hayCambios(): boolean {
  // Captura los nuevos valores de los inputs
  const newUsername = document.querySelector('div.edit-username') as HTMLDivElement;
  const newBio = document.querySelector('div.edit-bio') as HTMLDivElement;
  const newProfileImageInput = document.querySelector('#profileImage') as HTMLInputElement;
  
  const newBannerImageInput = document.querySelector('#bannerImage') as HTMLInputElement;
  const username = newUsername.innerText;
  const bio = newBio.innerText;
  const newProfileImage = newProfileImageInput?.files?.[0] || null;
  const newBannerImage = newBannerImageInput?.files?.[0] || null;
  if (
    this.user.username !== username ||
    this.user.bio !== bio ||
    newProfileImage !== null ||
    newBannerImage !== null
  ){
    // Guarda los cambios realizados en el perfil
    this.datosEditados = {
      username: username,
      bio: bio,
      profileImage: newProfileImage,
      bannerImage: newBannerImage
    };
    
  };
  return (
    this.user.username !== username ||
    this.user.bio !== bio ||
    newProfileImage !== null ||
    newBannerImage !== null
  );
}


limitarTexto(event: Event, maxLength: number) {
  const el = event.target as HTMLElement;
  if (el.textContent && el.textContent.length > maxLength) {
    el.textContent = el.textContent.substring(0, maxLength);
    // mover el cursor al final
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
}


  
}