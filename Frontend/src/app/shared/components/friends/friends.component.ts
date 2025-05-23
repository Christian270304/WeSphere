import { Component } from '@angular/core';
 import { UserService } from '../../../core/services/user.service';
 
 @Component({
   selector: 'app-friends',
   imports: [],
   templateUrl: './friends.component.html',
   styleUrl: './friends.component.scss'
 })
 export class FriendsComponent {
   public friends: any[] = []; 
 
   constructor(private userService: UserService) {}
 
   ngOnInit() {
     this.userService.getFriends().subscribe({
       next: (response) => {
         this.friends = response.friends; 
       },
       error: (err) => {
         console.error('Error al obtener amigos:', err);
       }
     });
   }
 }