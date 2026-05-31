import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shimmer-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type === 'card') {
      <div class="animate-pulse rounded-2xl bg-gray-200 h-48 w-full"></div>
    } @else if (type === 'list') {
      @for (i of items; track $index) {
        <div class="animate-pulse flex space-x-3 items-center mb-4">
          <div class="rounded-full bg-gray-200 h-10 w-10 flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      }
    } @else {
      @for (i of items; track $index) {
        <div class="animate-pulse h-3 bg-gray-200 rounded mb-2"
          [style.width]="$index % 3 === 0 ? '100%' : $index % 3 === 1 ? '80%' : '60%'"></div>
      }
    }
  `
})
export class ShimmerSkeletonComponent {
  @Input() type: 'card' | 'list' | 'text' = 'text';
  @Input() lines = 3;
  get items(): unknown[] { return Array(this.lines).fill(null); }
}
