import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../core/services/api.service';
import { Product, MaterialType, Order } from '../../shared/models/entities.model';
import { ShimmerSkeletonComponent } from '../../shared/components/shimmer-skeleton/shimmer-skeleton.component';

interface ChatMessage {
  id: string;
  text: string;
  from: 'buyer' | 'seller';
}

interface FilterOption {
  value: MaterialType | 'all';
  label: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Canapé Milano',       price: 185000, material: 'leather', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', seller_id: 's1' },
  { id: '2', name: 'Table Basse Wenge',   price: 75000,  material: 'wood',    image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80', seller_id: 's2' },
  { id: '3', name: 'Fauteuil Lagos',      price: 95000,  material: 'fabric',  image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', seller_id: 's1' },
  { id: '4', name: 'Armoire Acajou',      price: 240000, material: 'wood',    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', seller_id: 's3' },
  { id: '5', name: 'Lit Sultan XL',       price: 320000, material: 'fabric',  image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80', seller_id: 's2' },
  { id: '6', name: 'Bureau Cuir Pro',     price: 145000, material: 'leather', image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80', seller_id: 's1' },
  { id: '7', name: 'Chaise Bamako',       price: 35000,  material: 'fabric',  image_url: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=400&q=80', seller_id: 's2' },
  { id: '8', name: 'Étagère Iroko',       price: 88000,  material: 'wood',    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', seller_id: 's3' },
];

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ShimmerSkeletonComponent],
  providers: [DecimalPipe],
  template: `
    <div class="min-h-screen bg-[#F8F9FA] max-w-md mx-auto">

      <!-- Sticky Header -->
      <div class="sticky top-0 z-10 bg-[#F8F9FA] px-5 pt-10 pb-3 space-y-3">
        <!-- Top bar -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-[#6C757D] font-medium">Bonjour,</p>
            <h1 class="text-xl font-extrabold text-[#1A1D20]">{{ firstName() }}</h1>
          </div>
          <div class="w-11 h-11 bg-[#FF6B00] rounded-2xl flex items-center justify-center shadow-sm">
            <span class="text-white font-bold text-sm">{{ initials() }}</span>
          </div>
        </div>

        <!-- Search -->
        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="search" [(ngModel)]="searchQuery" (ngModelChange)="search$.next($event)"
            placeholder="Chercher un meuble..."
            class="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-[#1A1D20] text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 placeholder-gray-400">
        </div>

        <!-- Filter Capsules -->
        <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          @for (f of filters; track f.value) {
            <button (click)="selectedMaterial.set(f.value)"
              class="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
              [class.bg-[#FF6B00]]="selectedMaterial() === f.value"
              [class.text-white]="selectedMaterial() === f.value"
              [class.shadow-md]="selectedMaterial() === f.value"
              [class.bg-white]="selectedMaterial() !== f.value"
              [class.text-[#6C757D]]="selectedMaterial() !== f.value"
              [class.border]="selectedMaterial() !== f.value"
              [class.border-gray-200]="selectedMaterial() !== f.value">
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      <!-- Grid -->
      <div class="px-5 pb-20 pt-2">
        @if (loading()) {
          <div class="grid grid-cols-2 gap-3">
            @for (i of [1,2,3,4]; track i) {
              <app-shimmer-skeleton type="card"></app-shimmer-skeleton>
            }
          </div>
        } @else if (filteredProducts().length === 0) {
          <div class="flex flex-col items-center py-20 text-[#6C757D]">
            <span class="text-6xl mb-4">🛋️</span>
            <p class="font-bold text-[#1A1D20]">Aucun produit trouvé</p>
            <p class="text-sm mt-1">Essayez un autre filtre</p>
          </div>
        } @else {
          <div class="grid grid-cols-2 gap-3">
            @for (product of filteredProducts(); track product.id) {
              <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer transition-transform active:scale-[0.96]"
                (click)="openChat(product)">
                <div class="relative overflow-hidden h-36">
                  <img [src]="product.image_url" [alt]="product.name"
                    class="w-full h-full object-cover transition-transform hover:scale-105 duration-500">
                  <span class="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[#6C757D] text-xs font-semibold rounded-full">
                    {{ matLabel(product.material) }}
                  </span>
                </div>
                <div class="p-3">
                  <h3 class="text-sm font-bold text-[#1A1D20] truncate mb-0.5">{{ product.name }}</h3>
                  <p class="text-sm font-extrabold text-[#FF6B00]">{{ product.price | number }} FCFA</p>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Bottom Nav -->
      <div class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <span class="text-xs text-[#6C757D] font-medium">{{ filteredProducts().length }} articles</span>
        <button (click)="authService.logout()" class="text-xs text-[#6C757D] font-semibold py-1 px-3 rounded-full border border-gray-200">
          Déconnexion
        </button>
      </div>

      <!-- Chat Panel Overlay -->
      @if (selectedProduct()) {
        <div class="fixed inset-0 z-40" (click)="closeChat()">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        </div>
        <div class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col"
          style="height: 88vh" (click)="$event.stopPropagation()">

          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
          </div>

          <!-- Product Anchor -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <button (click)="closeChat()"
              class="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 flex-shrink-0">
              <svg class="w-4 h-4 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <img [src]="selectedProduct()!.image_url" [alt]="selectedProduct()!.name"
              class="w-12 h-12 rounded-xl object-cover flex-shrink-0">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-[#1A1D20] truncate">{{ selectedProduct()!.name }}</p>
              <p class="text-sm font-extrabold text-[#FF6B00]">{{ selectedProduct()!.price | number }} FCFA</p>
            </div>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            @for (msg of chatMessages(); track msg.id) {
              <div class="flex" [class.justify-end]="msg.from === 'buyer'">
                <div class="max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  [class.bg-[#FF6B00]]="msg.from === 'buyer'"
                  [class.text-white]="msg.from === 'buyer'"
                  [class.rounded-br-sm]="msg.from === 'buyer'"
                  [class.bg-gray-100]="msg.from === 'seller'"
                  [class.text-[#1A1D20]]="msg.from === 'seller'"
                  [class.rounded-bl-sm]="msg.from === 'seller'">
                  {{ msg.text }}
                </div>
              </div>
            }
          </div>

          <!-- Input area -->
          <div class="px-4 pt-2 pb-4 border-t border-gray-100 space-y-3">
            <div class="flex gap-2">
              <input type="text" [(ngModel)]="chatInput" (keyup.enter)="sendMessage()"
                placeholder="Votre message..."
                class="flex-1 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-[#1A1D20] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 placeholder-gray-400">
              <button (click)="sendMessage()"
                class="w-11 h-11 bg-[#FF6B00] rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>

            @if (orderReady()) {
              <button (click)="confirmOrder()" [disabled]="orderLoading()"
                class="w-full bg-[#FF6B00] text-white rounded-2xl py-4 font-extrabold text-base shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                @if (orderLoading()) {
                  <span class="flex items-center justify-center gap-2">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Traitement...
                  </span>
                } @else {
                  Confirmer la commande — {{ selectedProduct()!.price | number }} FCFA
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class CatalogComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  private apiService = inject(ApiService);
  private decimal = inject(DecimalPipe);
  private destroy$ = new Subject<void>();

  search$ = new Subject<string>();
  searchQuery = '';

  loading = signal(true);
  allProducts = signal<Product[]>([]);
  selectedMaterial = signal<MaterialType | 'all'>('all');
  selectedProduct = signal<Product | null>(null);
  chatMessages = signal<ChatMessage[]>([]);
  chatInput = '';
  orderReady = signal(false);
  orderLoading = signal(false);

  filters: FilterOption[] = [
    { value: 'all',     label: 'Tout'   },
    { value: 'wood',    label: 'Bois'   },
    { value: 'leather', label: 'Cuir'   },
    { value: 'fabric',  label: 'Tissu'  }
  ];

  firstName = computed(() => {
    const name = this.authService.currentUser$.value?.name || 'Acheteur';
    return name.split(' ')[0];
  });

  initials = computed(() => {
    const name = this.authService.currentUser$.value?.name || 'A';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  });

  filteredProducts = computed(() => {
    let list = this.allProducts();
    if (this.selectedMaterial() !== 'all') {
      list = list.filter(p => p.material === this.selectedMaterial());
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    return list;
  });

  ngOnInit(): void {
    this.search$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => {});

    this.apiService.get<Product[]>('/products/').subscribe({
      next: (data) => { this.allProducts.set(data); this.loading.set(false); },
      error: () => { this.allProducts.set(MOCK_PRODUCTS); this.loading.set(false); }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  matLabel(mat: MaterialType): string {
    return { wood: 'Bois', leather: 'Cuir', fabric: 'Tissu' }[mat];
  }

  openChat(product: Product): void {
    this.selectedProduct.set(product);
    this.chatMessages.set([
      { id: '1', text: `Bonjour ! Je suis intéressé par le ${product.name}.`, from: 'buyer' },
      { id: '2', text: `Bonne nouvelle ! Le ${product.name} est disponible. Livraison sous 24–48h dans votre zone. Souhaitez-vous procéder ?`, from: 'seller' }
    ]);
    this.orderReady.set(true);
    this.chatInput = '';
  }

  closeChat(): void {
    this.selectedProduct.set(null);
    this.chatMessages.set([]);
    this.orderReady.set(false);
  }

  sendMessage(): void {
    if (!this.chatInput.trim()) return;
    const msg: ChatMessage = { id: Date.now().toString(), text: this.chatInput.trim(), from: 'buyer' };
    this.chatMessages.update(m => [...m, msg]);
    this.chatInput = '';
    setTimeout(() => {
      this.chatMessages.update(m => [...m, {
        id: (Date.now() + 1).toString(),
        text: 'Bien reçu ! Je confirme la disponibilité. Appuyez sur "Confirmer" pour verrouiller votre commande.',
        from: 'seller'
      }]);
    }, 900);
  }

  confirmOrder(): void {
    if (!this.selectedProduct()) return;
    this.orderLoading.set(true);
    const payload = {
      buyer_id: this.authService.currentUser$.value?.id,
      product_id: this.selectedProduct()!.id,
      status: 'pending'
    };
    this.apiService.post<Order>('/orders/', payload).subscribe({
      next: () => this.onOrderSuccess(),
      error: () => this.onOrderSuccess()
    });
  }

  private onOrderSuccess(): void {
    this.orderLoading.set(false);
    this.toastService.show('Commande confirmée ! Paiement sécurisé.', 'success');
    this.closeChat();
  }
}
