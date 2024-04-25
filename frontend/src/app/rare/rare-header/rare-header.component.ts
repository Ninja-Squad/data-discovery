import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'dd-header',
  templateUrl: './rare-header.component.html',
  styleUrl: './rare-header.component.scss',
  standalone: true,
  imports: []
})
export class RareHeaderComponent {
  isRareApp: boolean;

  constructor() {
    this.isRareApp = environment.name === 'rare';
  }
}
