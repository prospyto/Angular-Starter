import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../models/entities.model';

const ROLE_META: Record<UserRole, { icon: string; label: string }> = {
  buyer:  { icon: '🛒', label: 'Acheteur'  },
  seller: { icon: '🏪', label: 'Vendeur'   },
  driver: { icon: '🚚', label: 'Livreur'   }
};

@Component({
  selector: 'app-role-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button"
      (click)="select.emit(role)"
      class="flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer w-full"
      [class.border-orange-500]="selected"
      [class.bg-orange-50]="selected"
      [class.border-gray-200]="!selected"
      [class.bg-white]="!selected">
      <span class="text-3xl mb-1.5 transition-all" [class.opacity-100]="selected" [class.opacity-40]="!selected">
        {{ meta.icon }}
      </span>
      <span class="text-xs font-bold transition-all"
        [class.text-orange-500]="selected"
        [class.text-gray-400]="!selected">
        {{ meta.label }}
      </span>
    </button>
  `
})
export class RoleCardComponent {
  @Input() role!: UserRole;
  @Input() selected = false;
  @Output() select = new EventEmitter<UserRole>();
  get meta() { return ROLE_META[this.role]; }
}
