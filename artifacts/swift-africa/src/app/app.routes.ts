import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'catalog',
    loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
    canActivate: [authGuard]
  },
  {
    path: 'seller',
    loadComponent: () => import('./features/seller/seller-dashboard.component').then(m => m.SellerDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'driver',
    loadComponent: () => import('./features/driver/driver-dashboard.component').then(m => m.DriverDashboardComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'auth' }
];
