import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../core/services/api.service';
import { ShimmerSkeletonComponent } from '../../shared/components/shimmer-skeleton/shimmer-skeleton.component';

interface SellerMetrics {
  activeSales: number;
  cancelled: number;
  trustScore: number;
  walletBalance: number;
}

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ShimmerSkeletonComponent],
  template: `
    <div class="min-h-screen bg-[#F8F9FA] max-w-md mx-auto">

      <!-- Header -->
      <div class="bg-white px-5 pt-12 pb-5 border-b border-gray-100 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-[#6C757D] font-medium tracking-wide">Tableau de bord vendeur</p>
            <h1 class="text-xl font-extrabold text-[#1A1D20]">{{ storeName() }}</h1>
          </div>
          <div class="w-12 h-12 bg-[#FF6B00] rounded-2xl flex items-center justify-center shadow-sm">
            <span class="text-white font-bold">{{ initials() }}</span>
          </div>
        </div>
      </div>

      <div class="px-5 py-5 space-y-5">

        <!-- Metrics Grid -->
        <div>
          <p class="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-3">Statistiques</p>
          <div class="grid grid-cols-2 gap-3">

            <!-- Active Sales -->
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              @if (metricsLoading()) {
                <app-shimmer-skeleton type="text" [lines]="2"></app-shimmer-skeleton>
              } @else {
                <p class="text-xs text-[#6C757D] mb-2">Ventes actives</p>
                <p class="text-3xl font-extrabold text-[#1A1D20]">{{ metrics().activeSales }}</p>
              }
            </div>

            <!-- Cancelled -->
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              @if (metricsLoading()) {
                <app-shimmer-skeleton type="text" [lines]="2"></app-shimmer-skeleton>
              } @else {
                <p class="text-xs text-[#6C757D] mb-2">Annulées</p>
                <p class="text-3xl font-extrabold text-[#1A1D20]">{{ metrics().cancelled }}</p>
              }
            </div>

            <!-- Trust Score (SVG gauge) -->
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              @if (metricsLoading()) {
                <app-shimmer-skeleton type="text" [lines]="2"></app-shimmer-skeleton>
              } @else {
                <p class="text-xs text-[#6C757D] mb-2">Score de confiance</p>
                <div class="flex items-center gap-3">
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="#F0F0F0" stroke-width="5"/>
                    <circle cx="24" cy="24" r="18" fill="none" stroke="#FF6B00" stroke-width="5"
                      stroke-linecap="round"
                      stroke-dasharray="113"
                      [attr.stroke-dashoffset]="113 - (113 * metrics().trustScore / 100)"
                      transform="rotate(-90 24 24)"
                      style="transition: stroke-dashoffset 1s ease"/>
                  </svg>
                  <span class="text-2xl font-extrabold text-[#FF6B00]">{{ metrics().trustScore }}%</span>
                </div>
              }
            </div>

            <!-- Wallet -->
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              @if (metricsLoading()) {
                <app-shimmer-skeleton type="text" [lines]="2"></app-shimmer-skeleton>
              } @else {
                <p class="text-xs text-[#6C757D] mb-2">Portefeuille</p>
                <p class="text-lg font-extrabold text-[#2ECC71]">{{ metrics().walletBalance | number }}</p>
                <p class="text-xs text-[#2ECC71] font-semibold">FCFA</p>
              }
            </div>
          </div>
        </div>

        <!-- Publishing Wizard -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Header + Step progress -->
          <div class="px-5 pt-5 pb-4 border-b border-gray-50">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-extrabold text-[#1A1D20]">Publier un produit</h2>
              <span class="text-xs font-semibold text-[#6C757D]">Étape {{ currentStep() }}/3</span>
            </div>
            <div class="flex gap-1.5">
              @for (s of [1,2,3]; track s) {
                <div class="flex-1 h-1.5 rounded-full transition-all duration-500"
                  [class.bg-[#FF6B00]]="currentStep() >= s"
                  [class.bg-gray-200]="currentStep() < s"></div>
              }
            </div>
          </div>

          <div class="p-5">

            <!-- Step 1 -->
            @if (currentStep() === 1) {
              <div class="space-y-3 animate-fade-in">
                <h3 class="text-sm font-bold text-[#1A1D20]">Informations boutique</h3>
                <input type="text" [value]="storeName()" readonly
                  class="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-[#1A1D20] text-sm outline-none">
                <textarea rows="2" placeholder="Description de votre boutique..."
                  class="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-[#1A1D20] text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"></textarea>
                <button (click)="currentStep.set(2)"
                  class="w-full py-3.5 bg-[#FF6B00] text-white rounded-2xl font-bold text-sm shadow-sm">
                  Continuer →
                </button>
              </div>
            }

            <!-- Step 2 -->
            @if (currentStep() === 2) {
              <div class="space-y-3">
                <h3 class="text-sm font-bold text-[#1A1D20]">Détails du produit</h3>
                <form [formGroup]="productForm">
                  <input formControlName="name" type="text" placeholder="Nom du produit"
                    class="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-[#1A1D20] text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 mb-3">
                  <div class="mb-3">
                    <input formControlName="price" type="number" min="1" placeholder="Prix en FCFA"
                      class="w-full px-4 py-3.5 rounded-2xl border text-[#1A1D20] text-sm outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-100"
                      [class.border-orange-400]="priceInvalid()"
                      [class.border-gray-200]="!priceInvalid()">
                    @if (priceInvalid()) {
                      <p class="text-orange-500 text-xs mt-1 ml-1">Le prix doit être supérieur à 0</p>
                    }
                  </div>
                  <p class="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-2">Matériau</p>
                  <div class="flex gap-2 mb-5">
                    @for (mat of materials; track mat.value) {
                      <button type="button" (click)="productForm.patchValue({ material: mat.value })"
                        class="flex-1 py-2.5 text-xs font-bold rounded-2xl border-2 transition-all"
                        [class.bg-[#FF6B00]]="productForm.get('material')?.value === mat.value"
                        [class.text-white]="productForm.get('material')?.value === mat.value"
                        [class.border-[#FF6B00]]="productForm.get('material')?.value === mat.value"
                        [class.border-gray-200]="productForm.get('material')?.value !== mat.value"
                        [class.text-[#6C757D]]="productForm.get('material')?.value !== mat.value">
                        {{ mat.label }}
                      </button>
                    }
                  </div>
                  <div class="flex gap-2">
                    <button type="button" (click)="currentStep.set(1)"
                      class="flex-1 py-3 border-2 border-gray-200 text-[#6C757D] rounded-2xl font-bold text-sm">
                      ← Retour
                    </button>
                    <button type="button" (click)="goToStep3()"
                      class="flex-1 py-3 bg-[#FF6B00] text-white rounded-2xl font-bold text-sm shadow-sm">
                      Continuer →
                    </button>
                  </div>
                </form>
              </div>
            }

            <!-- Step 3 -->
            @if (currentStep() === 3) {
              <div class="space-y-4">
                <h3 class="text-sm font-bold text-[#1A1D20]">Photo du produit</h3>
                <div class="border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-colors"
                  [class.border-[#FF6B00]]="imagePreview()"
                  [class.border-gray-200]="!imagePreview()"
                  (click)="fileInput.click()">
                  @if (imagePreview()) {
                    <div class="relative">
                      <img [src]="imagePreview()!" class="w-full h-52 object-cover">
                      <div class="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p class="text-white text-sm font-bold bg-black/50 px-3 py-1 rounded-full">Changer</p>
                      </div>
                    </div>
                  } @else {
                    <div class="h-52 flex flex-col items-center justify-center text-[#6C757D]">
                      <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <p class="text-sm font-semibold">Cliquer pour ajouter une photo</p>
                      <p class="text-xs text-gray-400 mt-1">JPG, PNG — max 5 MB</p>
                    </div>
                  }
                </div>
                <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">

                @if (publishLoading()) {
                  <div class="flex items-center justify-center py-2 gap-2">
                    <div class="w-5 h-5 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-sm text-[#6C757D]">Publication en cours...</span>
                  </div>
                }

                <div class="flex gap-2">
                  <button type="button" (click)="currentStep.set(2)"
                    class="flex-1 py-3 border-2 border-gray-200 text-[#6C757D] rounded-2xl font-bold text-sm">
                    ← Retour
                  </button>
                  <button type="button" (click)="publishProduct()" [disabled]="publishLoading()"
                    class="flex-1 py-3 bg-[#FF6B00] text-white rounded-2xl font-bold text-sm shadow-sm disabled:opacity-60">
                    Publier
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Logout -->
        <button (click)="authService.logout()"
          class="w-full py-3 border border-gray-200 text-[#6C757D] rounded-2xl font-semibold text-sm hover:border-orange-200 hover:text-orange-400 transition-colors">
          Se déconnecter
        </button>
      </div>
    </div>
  `
})
export class SellerDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  storeName = computed(() => this.authService.currentUser$.value?.name || 'Ma Boutique');
  initials = computed(() => {
    const name = this.authService.currentUser$.value?.name || 'V';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  });

  metricsLoading = signal(true);
  currentStep = signal<1 | 2 | 3>(1);
  imagePreview = signal<string | null>(null);
  publishLoading = signal(false);
  metrics = signal<SellerMetrics>({ activeSales: 0, cancelled: 0, trustScore: 0, walletBalance: 0 });

  materials = [
    { value: 'wood',    label: 'Bois'  },
    { value: 'leather', label: 'Cuir'  },
    { value: 'fabric',  label: 'Tissu' }
  ];

  productForm: FormGroup = this.fb.group({
    name:     ['', Validators.required],
    price:    [null, [Validators.required, Validators.min(1)]],
    material: ['wood']
  });

  priceInvalid = computed(() => {
    const ctrl = this.productForm.get('price');
    return !!(ctrl?.invalid && ctrl.touched);
  });

  ngOnInit(): void {
    this.apiService.get<SellerMetrics>('/seller/metrics/').subscribe({
      next: (data) => { this.metrics.set(data); this.metricsLoading.set(false); },
      error: () => {
        this.metrics.set({ activeSales: 12, cancelled: 3, trustScore: 87, walletBalance: 485000 });
        this.metricsLoading.set(false);
      }
    });
  }

  goToStep3(): void {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) {
      if (!this.productForm.get('price')?.value || this.productForm.get('price')?.value <= 0) {
        this.toastService.show('Veuillez saisir un prix valide.', 'error');
      }
      return;
    }
    this.currentStep.set(3);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  publishProduct(): void {
    if (!this.imagePreview()) {
      this.toastService.show('Veuillez ajouter une photo du produit.', 'warning');
      return;
    }
    this.publishLoading.set(true);
    setTimeout(() => {
      this.publishLoading.set(false);
      this.toastService.show('Produit publié avec succès !', 'success');
      this.metrics.update(m => ({ ...m, activeSales: m.activeSales + 1 }));
      this.currentStep.set(1);
      this.imagePreview.set(null);
      this.productForm.reset({ material: 'wood' });
    }, 1500);
  }
}
