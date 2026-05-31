import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../core/services/api.service';

interface Mission {
  id: string;
  pickupCity: string;
  dropoffCity: string;
  earnings: number;
  distance: number;
  orderId: string;
}

const MOCK_MISSIONS: Mission[] = [
  { id: 'm1', pickupCity: 'Plateau (Abidjan)', dropoffCity: 'Cocody',          earnings: 8500,  distance: 12, orderId: 'o1' },
  { id: 'm2', pickupCity: 'Yopougon',          dropoffCity: 'Marcory',         earnings: 12000, distance: 18, orderId: 'o2' },
  { id: 'm3', pickupCity: 'Treichville',       dropoffCity: 'Abobo',           earnings: 15500, distance: 25, orderId: 'o3' },
  { id: 'm4', pickupCity: 'Adjamé',            dropoffCity: 'Bingerville',     earnings: 22000, distance: 34, orderId: 'o4' },
];

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#F8F9FA] max-w-md mx-auto flex flex-col">

      <!-- MAP AREA -->
      @if (!activeMission()) {
        <!-- Idle map — 45vh -->
        <div class="bg-gradient-to-br from-gray-200 to-gray-300 rounded-b-3xl flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0"
          style="height: 45vh">
          <!-- Grid lines -->
          <div class="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-10">
            @for (i of gridCells; track i) {
              <div class="border border-gray-600"></div>
            }
          </div>
          <!-- Road lines -->
          <div class="absolute inset-0 opacity-5">
            <div class="absolute top-1/2 left-0 right-0 h-px bg-gray-800"></div>
            <div class="absolute top-0 bottom-0 left-1/2 w-px bg-gray-800"></div>
          </div>
          <!-- Ping dot -->
          <div class="relative mb-4">
            <div class="w-4 h-4 bg-[#FF6B00] rounded-full shadow-lg">
              <div class="absolute inset-0 bg-[#FF6B00] rounded-full animate-ping opacity-60"></div>
            </div>
          </div>
          <p class="text-[#6C757D] text-sm font-semibold">GPS en direct — Activation...</p>
          <p class="text-gray-400 text-xs mt-1">{{ currentLocation() }}</p>
        </div>
      } @else {
        <!-- Active navigation map — 65vh -->
        <div class="bg-gradient-to-br from-gray-200 to-gray-300 rounded-b-3xl relative overflow-hidden flex-shrink-0"
          style="height: 65vh">
          <div class="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-10">
            @for (i of gridCells; track i) {
              <div class="border border-gray-600"></div>
            }
          </div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="relative">
              <div class="w-5 h-5 bg-[#FF6B00] rounded-full shadow-xl">
                <div class="absolute inset-0 bg-[#FF6B00] rounded-full animate-ping opacity-60"></div>
              </div>
            </div>
          </div>
          <div class="absolute top-4 right-4 bg-[#FF6B00] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md">
            Navigation active
          </div>

          <!-- Navigation HUD -->
          <div class="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-4 shadow-2xl">
            <p class="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-3">Mission en cours</p>
            <div class="space-y-2 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span class="text-sm">📦</span>
                </div>
                <div>
                  <p class="text-xs text-[#6C757D]">Pickup</p>
                  <p class="text-sm font-bold text-[#1A1D20]">{{ activeMission()!.pickupCity }}</p>
                </div>
              </div>
              <div class="ml-4 border-l-2 border-dashed border-gray-200 h-3"></div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span class="text-sm">🏠</span>
                </div>
                <div>
                  <p class="text-xs text-[#6C757D]">Livraison</p>
                  <p class="text-sm font-bold text-[#1A1D20]">{{ activeMission()!.dropoffCity }}</p>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button (click)="updateStatus('pickup')"
                class="flex-1 py-2.5 bg-[#FF6B00] text-white rounded-2xl text-xs font-bold shadow-sm">
                📦 Récupéré
              </button>
              <button (click)="updateStatus('delivered')"
                class="flex-1 py-2.5 bg-[#2ECC71] text-white rounded-2xl text-xs font-bold shadow-sm">
                ✓ Livré
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Profile + Availability Toggle -->
      <div class="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 bg-[#FF6B00] rounded-2xl flex items-center justify-center shadow-sm">
            <span class="text-white font-bold text-sm">{{ initials() }}</span>
          </div>
          <div>
            <p class="text-sm font-bold text-[#1A1D20]">{{ currentUser()?.name || 'Livreur' }}</p>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 rounded-full text-xs font-bold text-[#FF6B00]">
              ⭐ {{ currentUser()?.trust_score || 85 }}% confiance
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold" [class.text-[#2ECC71]]="isAvailable()" [class.text-[#6C757D]]="!isAvailable()">
            {{ isAvailable() ? 'En service' : 'Hors ligne' }}
          </span>
          <button (click)="isAvailable.set(!isAvailable())"
            class="relative w-13 h-7 rounded-full transition-all duration-300 flex-shrink-0"
            [class.bg-[#2ECC71]]="isAvailable()"
            [class.bg-gray-300]="!isAvailable()"
            style="width: 52px; height: 28px">
            <div class="absolute w-5 h-5 bg-white rounded-full shadow-md top-1.5 transition-all duration-300"
              [style.left]="isAvailable() ? '28px' : '4px'"></div>
          </button>
        </div>
      </div>

      <!-- Mission Queue -->
      <div class="flex-1 overflow-y-auto">
        @if (!activeMission()) {
          <div class="px-5 py-4">
            <p class="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-3">
              Missions disponibles ({{ missions().length }})
            </p>

            @if (missions().length === 0) {
              <div class="flex flex-col items-center py-16 text-[#6C757D]">
                <span class="text-6xl mb-4">🚚</span>
                <p class="font-bold text-[#1A1D20]">Aucune mission disponible</p>
                <p class="text-sm mt-1">Activez votre service pour recevoir des missions</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (mission of missions(); track mission.id) {
                  <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-[#1A1D20]">
                          {{ mission.pickupCity }}
                          <span class="text-[#FF6B00] mx-1">➔</span>
                          {{ mission.dropoffCity }}
                        </p>
                        <div class="flex items-center gap-3 mt-1">
                          <span class="text-xs text-[#6C757D]">📍 {{ mission.distance }} km</span>
                        </div>
                      </div>
                      <span class="text-base font-extrabold text-[#2ECC71] flex-shrink-0 ml-2">
                        +{{ mission.earnings | number }} FCFA
                      </span>
                    </div>
                    <div class="flex gap-2">
                      <button (click)="acceptMission(mission)"
                        class="flex-1 py-2.5 bg-[#FF6B00] text-white rounded-2xl font-bold text-sm shadow-sm active:scale-[0.97] transition-transform">
                        Accepter
                      </button>
                      <button (click)="declineMission(mission.id)"
                        class="flex-1 py-2.5 border-2 border-[#FF6B00] text-[#FF6B00] rounded-2xl font-bold text-sm active:scale-[0.97] transition-transform">
                        Décliner
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Bottom actions -->
      <div class="px-5 pb-8 pt-3 flex-shrink-0">
        <button (click)="authService.logout()"
          class="w-full py-3 border border-gray-200 text-[#6C757D] rounded-2xl font-semibold text-sm">
          Se déconnecter
        </button>
      </div>
    </div>
  `
})
export class DriverDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  private apiService = inject(ApiService);

  currentUser = computed(() => this.authService.currentUser$.value);
  initials = computed(() => {
    const name = this.authService.currentUser$.value?.name || 'D';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  });

  missions = signal<Mission[]>(MOCK_MISSIONS);
  activeMission = signal<Mission | null>(null);
  isAvailable = signal(true);
  currentLocation = signal('Abidjan, Côte d\'Ivoire');
  gridCells = Array(64).fill(null);

  ngOnInit(): void {
    this.apiService.get<Mission[]>('/driver/missions/').subscribe({
      next: (data) => this.missions.set(data),
      error: () => {}
    });
  }

  acceptMission(mission: Mission): void {
    this.activeMission.set(mission);
    this.missions.update(list => list.filter(m => m.id !== mission.id));
    this.toastService.show('Mission acceptée ! Bonne route.', 'success');
  }

  declineMission(id: string): void {
    this.missions.update(list => list.filter(m => m.id !== id));
    this.toastService.show('Mission déclinée.', 'warning');
  }

  updateStatus(status: 'pickup' | 'delivered'): void {
    const mission = this.activeMission();
    if (!mission) return;
    this.apiService.patch(`/orders/${mission.orderId}/`, { status }).subscribe({
      next: () => {},
      error: () => {}
    });
    if (status === 'pickup') {
      this.toastService.show('Colis récupéré ! En route vers la livraison.', 'success');
    } else {
      this.toastService.show('Livraison confirmée ! Mission accomplie.', 'success');
      this.activeMission.set(null);
    }
  }
}
