import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './navigation.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavigationComponent
  ],
  template: `
    <app-navigation>
      <router-outlet></router-outlet>
    </app-navigation>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class LayoutComponent {} 