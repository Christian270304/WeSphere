import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AppComponent } from './app.component';

export const routes: Routes = [
    { path: '', component: AppComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'home' }
];
