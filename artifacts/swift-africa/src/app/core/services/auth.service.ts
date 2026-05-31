import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User, UserRole } from '../../shared/models/entities.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const userData = localStorage.getItem('swift_user');
    if (userData) {
      try {
        this.currentUser$.next(JSON.parse(userData));
      } catch {
        localStorage.removeItem('swift_user');
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('swift_token');
  }

  getRole(): UserRole | null {
    return this.currentUser$.value?.role ?? null;
  }

  login(token: string, user: User): void {
    localStorage.setItem('swift_token', token);
    localStorage.setItem('swift_user', JSON.stringify(user));
    this.currentUser$.next(user);
    this.redirectByRole(user.role);
  }

  logout(): void {
    localStorage.removeItem('swift_token');
    localStorage.removeItem('swift_user');
    this.currentUser$.next(null);
    this.router.navigate(['/auth']);
  }

  private redirectByRole(role: UserRole): void {
    const routes: Record<UserRole, string> = {
      driver: '/driver',
      seller: '/seller',
      buyer: '/catalog'
    };
    this.router.navigate([routes[role]]);
  }
}
