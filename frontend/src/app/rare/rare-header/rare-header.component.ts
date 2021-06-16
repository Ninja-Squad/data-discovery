import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'dd-header',
  templateUrl: './rare-header.component.html',
  styleUrls: ['./rare-header.component.scss']
})
export class RareHeaderComponent {
  isRareApp: boolean;

  constructor() {
    this.isRareApp = environment.title.startsWith('RARe');
  }
}
