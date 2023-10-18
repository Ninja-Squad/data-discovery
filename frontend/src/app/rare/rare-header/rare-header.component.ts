import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NgIf } from '@angular/common';

@Component({
  selector: 'dd-header',
  templateUrl: './rare-header.component.html',
  styleUrls: ['./rare-header.component.scss'],
  standalone: true,
  imports: [NgIf]
})
export class RareHeaderComponent {
  isRareApp: boolean;

  constructor() {
    this.isRareApp = environment.name === 'rare';
  }
}
