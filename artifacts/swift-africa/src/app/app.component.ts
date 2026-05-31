import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastBannerComponent } from './shared/components/toast-banner/toast-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastBannerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-banner></app-toast-banner>
  `
})
export class AppComponent {}
