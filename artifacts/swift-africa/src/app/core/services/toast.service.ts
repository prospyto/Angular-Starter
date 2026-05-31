import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning';
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast = signal<Toast | null>(null);
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'warning'): void {
    const id = ++this.counter;
    this.toast.set({ message, type, id });
    setTimeout(() => {
      if (this.toast()?.id === id) {
        this.toast.set(null);
      }
    }, 3000);
  }
}
