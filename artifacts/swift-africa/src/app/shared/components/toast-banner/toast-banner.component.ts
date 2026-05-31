import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-banner',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    @keyframes slideUp {
      from { opacity: 0; transform: translateX(-50%) translateY(1.5rem); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .toast-enter { animation: slideUp 0.25s ease-out forwards; }
  `],
  template: `
    @if (toastService.toast(); as t) {
      <div
        class="toast-enter fixed bottom-8 left-1/2 z-50 min-w-72 max-w-sm px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2"
        [class]="bgClass(t.type)">
        <span>{{ icon(t.type) }}</span>
        <span>{{ t.message }}</span>
      </div>
    }
  `
})
export class ToastBannerComponent {
  toastService = inject(ToastService);

  bgClass(type: string): string {
    return type === 'success' ? 'bg-[#2ECC71]'
      : type === 'error' ? 'bg-red-500'
      : 'bg-[#FF6B00]';
  }

  icon(type: string): string {
    return type === 'success' ? '✓' : type === 'error' ? '✕' : '!';
  }
}
