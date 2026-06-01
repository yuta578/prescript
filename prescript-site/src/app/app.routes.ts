import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'start',
    loadComponent: () =>
      import('./start/start.component').then(m => m.StartComponent),
  },
  {
    path: 'menu',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./menu/menu.component').then(m => m.MenuComponent),
  },
  {
    path: 'script',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./script/game.component').then(m => m.GameComponent),
  },
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'start',
  },
];