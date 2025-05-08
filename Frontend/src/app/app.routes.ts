import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ProfileComponent } from './features/profile/profile.component';
import { AuthComponent } from './features/auth/auth.component';
import { MessagesComponent } from './features/messages/messages.component';
import { ExplorerComponent } from './features/explorer/explorer.component';
import { CommentsComponent } from './features/comments/comments.component';
import { SavedPostsComponent } from './features/saved-posts/saved-posts.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
    { path: '', component: AuthComponent },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'profile/:username', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
    { path: 'explorer', component: ExplorerComponent, canActivate: [AuthGuard] },
    { path: 'comments', component: CommentsComponent, canActivate: [AuthGuard] },
    { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
    { path: 'saved-posts', component: SavedPostsComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'home' }
];
