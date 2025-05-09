import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChangeDetectorRef, Component } from '@angular/core';
import { UserStatsComponent } from '../../shared/components/user-stats/user-stats.component';
import { UserActionsComponent } from '../../shared/components/user-actions/user-actions.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostsComponent } from '../../shared/components/posts/posts.component';
import { HeaderStateService } from '../../core/services/header-state.service';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { FriendsComponent } from '../../shared/components/friends/friends.component';
import { ErrorService } from '../../core/services/error.service';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, UserStatsComponent, UserActionsComponent, RouterModule, PostsComponent, FormsModule, FriendsComponent, ErrorMessageComponent],
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
  public isPrivate: boolean = false;

  public cancelar: boolean = false;

  public originalUser: any;

  private destroy$ = new Subject<void>();
  noPosts: boolean = false; 

  
  cambiosRealizados: boolean = false;

  // Propiedades temporales para los datos editados
  datosEditados = {
    username: '',
    bio: '',
    profileImage: null as  File | null,
    bannerImage: null as File | null 
  };

  constructor(private route: ActivatedRoute, private headerStateService: HeaderStateService, private userService: UserService,  private cdr: ChangeDetectorRef, private errorService: ErrorService) {}

  ngOnInit() {
    this.isPrivate = false;
    const isMobile = window.innerWidth <= 768; 
    if (!isMobile) {
      this.headerStateService.setHideElements(true);
    } 

    this.loadProfile();
  }

  ngOnDestroy() {
    this.destroy$.next(); 
    this.destroy$.complete();
    this.userId = null;
    this.isPrivate = false;
  }

  private loadProfile() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const usernameFromUrl = params.get('username');
      this.userId = null;

      if (!usernameFromUrl) {
        this.userService
          .getUser()
          .pipe(takeUntil(this.destroy$))
          .subscribe((user) => {
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
        this.userService
          .getUserByUsername(usernameFromUrl)
          .pipe(takeUntil(this.destroy$))
          .subscribe((profileUser) => {
            if (profileUser) {
              this.user = profileUser.user;
              this.userId = profileUser.user.id;
              this.isOwnProfile =
                profileUser.current_user_id === profileUser.user.id;
              this.noExists = false;
              this.cdr.detectChanges();

              if (profileUser.user.is_private) {
                this.noPosts = true;
                this.isPrivate = true;

                this.userService
                  .isFollowing(profileUser.user.id)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (isFollowing) => {
                      if (isFollowing.isFollowing) {
                        this.noPosts = false;
                        this.isPrivate = false;
                        this.cdr.detectChanges();
                      }
                    },
                  });
              }
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
    if (this.hayCambios()){
      this.mostrarConfirmacion = true;
    } else {
      this.editandoPerfil = false;
      this.cancelar = true;
        setTimeout(() => {
          this.cancelar = false;
        }, 100);
    }
    // // Capturar los nuevos valores de los inputs
    // const newUsername = document.querySelector('div.edit-username') as HTMLDivElement;
    // const username = newUsername.innerText;
    // if (this.editableUser.username === username) {
    //   this.editandoPerfil = false;
      

    //     this.cancelar = true;
    //     setTimeout(() => {
    //       this.cancelar = false;
    //     }, 100);
      
    // } else if (this.editableUser.username != username) {
    //   this.mostrarConfirmacion = true;
    // }
   
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
        if (response) {
          window.location.reload(); 
        }
      },
      error: (err) => {
        const Username = document.querySelector('div.username') as HTMLDivElement;
        Username.innerHTML = this.originalUser.username;
        this.errorService.setError(err.error.error);
      }
    });
  }
}

confirmarCancelar() {
  

  const bio = document.querySelector('div.edit-bio') as HTMLDivElement;
  const username = document.querySelector('div.edit-username') as HTMLDivElement;
  const banner = document.querySelector('#banner') as HTMLImageElement;
  const profile = document.querySelector('#profile') as HTMLImageElement;
  console.log(this.originalUser);
  banner.src = this.originalUser.bannerImage?.url;
  profile.src = this.originalUser.profileImage?.url;
  bio.innerHTML = this.originalUser.bio;
  username.innerHTML = this.originalUser.username;

  this.mostrarConfirmacion = false;
  this.editandoPerfil = false;
  this.cancelar = true;
  setTimeout(() => {
    this.cancelar = false;
  }, 100);
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

onProfileImageChange(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files[0]) {
    const file = input.files[0];

    const imageUrl = URL.createObjectURL(file);
    this.user.profileImage.url = imageUrl;

    setTimeout(() => URL.revokeObjectURL(imageUrl), 100);
  }
}

onBannerImageChange(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files[0]) {
    const file = input.files[0];

    const imageUrl = URL.createObjectURL(file);
    this.user.bannerImage.url = imageUrl;

    setTimeout(() => URL.revokeObjectURL(imageUrl), 100);
  }
}
}