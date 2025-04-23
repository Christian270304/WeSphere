import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Output } from '@angular/core';
import { UserStatsComponent } from '../../shared/components/user-stats/user-stats.component';
import { UserActionsComponent } from '../../shared/components/user-actions/user-actions.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostsComponent } from '../../shared/components/posts/posts.component';
import { HeaderStateService } from '../../core/services/header-state.service';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, UserStatsComponent, UserActionsComponent, RouterModule, PostsComponent, FormsModule],
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

  public originalUser: any;

  

  constructor(private route: ActivatedRoute, private headerStateService: HeaderStateService, private userService: UserService,  private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.headerStateService.setHideElements(true);

    this.route.paramMap.subscribe(params => {
      const usernameFromUrl = params.get('username');
      this.userId = null;  

      if (!usernameFromUrl) {
        this.userService.getUser().subscribe(user => {
        this.originalUser = structuredClone(user); // copia original para restaurar
          
          
          this.user = structuredClone(user);
          this.userId = user.id;
          this.isOwnProfile = true;
          this.noExists = false; 
          this.cdr.detectChanges(); 
          console.log(this.user);
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

  ngOnDestroy() {
    this.userId = null;
  }

  // public handleChildEvent(value: boolean): void {
  //   console.log('Valor recibido del hijo:', value);
  //   this.editandoPerfil = value; // Actualiza el estado local
  // }








public editableUser: any = {
  username: '',
  bio: '',
  profileImage: 0,
  bannerImage: 0
};

public handleChildEvent(event: boolean) {
  if (event) {
    this.editandoPerfil = true;
    this.editableUser = {
      username: this.user.username,
      bio: this.user.bio,
      profileImage: { url: this.user.profileImage?.url || '' },
      bannerImage: { url: this.user.bannerImage?.url || '' }
    };
  } else {
    this.cancelarEdicion();
  }
}

seleccionarNuevaImagen(tipo: 'banner' | 'profile') {
  // Aquí podrías abrir un input tipo file o lanzar un modal para seleccionar imagen
  console.log(`Seleccionar nueva imagen para: ${tipo}`);
  // Seleccionar el input de file 
  const input = document.querySelector(`#image`) as HTMLInputElement;
  if (input) {
    input.click();
  }
}







guardarCambios() {
  this.user = { ...this.user, ...this.editableUser };
  this.editandoPerfil = false;
}

cancelarEdicion() {
  if (this.hayCambios()) {
    this.mostrarConfirmacion = true;
  } else {
    this.editandoPerfil = false;
  }
}



confirmarCancelar() {
  this.user = structuredClone(this.originalUser);
  this.editandoPerfil = false;
  this.mostrarConfirmacion = false;
}


hayCambios(): boolean {
  return (
    this.user.username !== this.originalUser.username ||
    this.user.bio !== this.originalUser.bio ||
    this.user.profileImage?.url !== this.originalUser.profileImage?.url ||
    this.user.bannerImage?.url !== this.originalUser.bannerImage?.url
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
