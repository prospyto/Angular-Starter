import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { RoleCardComponent } from '../../shared/components/role-card/role-card.component';
import { UserRole } from '../../shared/models/entities.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RoleCardComponent],
  template: `
    <div class="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-5">
      <div class="w-full max-w-md">

        <!-- Brand -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-3 mb-3">
            <div class="w-12 h-12 bg-[#FF6B00] rounded-2xl flex items-center justify-center shadow-md">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div class="text-left">
              <h1 class="text-2xl font-extrabold text-[#1A1D20] leading-none">Swift Africa</h1>
              <p class="text-xs text-[#6C757D] font-medium">formerly GOPICK</p>
            </div>
          </div>
          <p class="text-sm text-[#6C757D]">Livraison premium à travers l'Afrique</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          <!-- Tab Toggle -->
          <div class="flex bg-gray-50 p-1.5 m-4 rounded-2xl">
            <button type="button" (click)="mode.set('login')"
              class="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200"
              [class.bg-white]="mode() === 'login'"
              [class.text-[#1A1D20]]="mode() === 'login'"
              [class.shadow-sm]="mode() === 'login'"
              [class.text-[#6C757D]]="mode() !== 'login'">
              Connexion
            </button>
            <button type="button" (click)="mode.set('register')"
              class="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200"
              [class.bg-white]="mode() === 'register'"
              [class.text-[#1A1D20]]="mode() === 'register'"
              [class.shadow-sm]="mode() === 'register'"
              [class.text-[#6C757D]]="mode() !== 'register'">
              Inscription
            </button>
          </div>

          <div class="px-5 pb-6">
            <!-- Role Selector -->
            <div class="mb-5">
              <p class="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-3">Je suis un</p>
              <div class="grid grid-cols-3 gap-3">
                @for (role of roles; track role) {
                  <app-role-card [role]="role" [selected]="selectedRole() === role" (select)="selectedRole.set($event)">
                  </app-role-card>
                }
              </div>
            </div>

            <form [formGroup]="form" (ngSubmit)="submit()">

              @if (mode() === 'register') {
                <div class="mb-3">
                  <input formControlName="name" type="text" placeholder="Nom complet"
                    class="w-full px-4 py-3.5 rounded-2xl border text-[#1A1D20] text-sm outline-none transition-all bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                    [class.border-orange-400]="isInvalid('name')" [class.border-gray-200]="!isInvalid('name')">
                  @if (isInvalid('name')) {
                    <p class="text-orange-500 text-xs mt-1 ml-1">Nom requis</p>
                  }
                </div>
              }

              <div class="mb-3">
                <input formControlName="phone" type="tel" placeholder="+225 01 23 45 67 89"
                  class="w-full px-4 py-3.5 rounded-2xl border text-[#1A1D20] text-sm outline-none transition-all bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                  [class.border-orange-400]="isInvalid('phone')" [class.border-gray-200]="!isInvalid('phone')">
                @if (isInvalid('phone')) {
                  <p class="text-orange-500 text-xs mt-1 ml-1">Numéro invalide (format africain)</p>
                }
              </div>

              <div class="mb-4">
                <input formControlName="password" type="password" placeholder="Mot de passe"
                  class="w-full px-4 py-3.5 rounded-2xl border text-[#1A1D20] text-sm outline-none transition-all bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                  [class.border-orange-400]="isInvalid('password')" [class.border-gray-200]="!isInvalid('password')">
                @if (isInvalid('password')) {
                  <p class="text-orange-500 text-xs mt-1 ml-1">Mot de passe requis (min. 6 caractères)</p>
                }
              </div>

              @if (mode() === 'register') {
                @if (selectedRole() === 'buyer') {
                  <div class="mb-4 space-y-2.5">
                    <p class="text-xs font-bold text-[#6C757D] uppercase tracking-widest">Adresse de livraison</p>
                    <input formControlName="address" type="text" placeholder="Adresse complète"
                      class="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-[#1A1D20] text-sm outline-none bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400">
                    <input formControlName="landmarks" type="text" placeholder="Points de repère"
                      class="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-[#1A1D20] text-sm outline-none bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400">
                  </div>
                }
                @if (selectedRole() === 'seller') {
                  <div class="mb-4 space-y-2.5">
                    <p class="text-xs font-bold text-[#6C757D] uppercase tracking-widest">Ma boutique</p>
                    <input formControlName="store_name" type="text" placeholder="Nom de la boutique"
                      class="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-[#1A1D20] text-sm outline-none bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400">
                    <textarea formControlName="store_description" rows="2" placeholder="Description de votre boutique"
                      class="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-[#1A1D20] text-sm outline-none bg-gray-50 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none"></textarea>
                  </div>
                }
              }

              <!-- Loading -->
              @if (loading()) {
                <div class="flex items-center justify-center py-2 mb-3">
                  <div class="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span class="text-sm text-[#6C757D]">Connexion en cours...</span>
                </div>
              }

              <button type="submit" [disabled]="loading()"
                class="w-full py-4 bg-[#FF6B00] text-white rounded-2xl font-bold text-base shadow-md transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                {{ mode() === 'login' ? 'Se connecter' : 'Créer mon compte' }}
              </button>
            </form>
          </div>
        </div>

        <p class="text-center text-xs text-gray-400 mt-5">
          Swift Africa &copy; 2025 — Logistique de confiance
        </p>
      </div>
    </div>
  `
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  mode = signal<'login' | 'register'>('login');
  selectedRole = signal<UserRole>('buyer');
  loading = signal(false);
  roles: UserRole[] = ['buyer', 'seller', 'driver'];

  form: FormGroup = this.fb.group({
    name: [''],
    phone: ['', [Validators.required, Validators.pattern(/^(\+?225|00225|\+?237|00237|\+?221|00221)?[\s\-]?[0-9\s]{8,12}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    address: [''],
    landmarks: [''],
    store_name: [''],
    store_description: ['']
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.get('phone')?.invalid || this.form.get('password')?.invalid) return;
    if (this.mode() === 'register' && !this.form.get('name')?.value?.trim()) {
      this.form.get('name')?.setErrors({ required: true });
      return;
    }

    this.loading.set(true);
    const payload = { ...this.form.value, role: this.selectedRole() };
    const endpoint = this.mode() === 'login' ? '/auth/login/' : '/auth/register/';

    this.apiService.post<{ token: string; user: any }>(endpoint, payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.authService.login(res.token, res.user);
        this.toastService.show('Connexion réussie !', 'success');
      },
      error: () => {
        this.loading.set(false);
        // Demo mode fallback — allows navigation without a real backend
        const demoUser = {
          id: 'demo-' + Date.now(),
          name: this.form.value.name || 'Utilisateur Demo',
          phone: this.form.value.phone,
          status: 'active',
          trust_score: 87,
          role: this.selectedRole()
        };
        this.authService.login('demo-token-' + Date.now(), demoUser);
        this.toastService.show('Mode démo activé', 'warning');
      }
    });
  }
}
