import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', component: AuthComponent },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
];
