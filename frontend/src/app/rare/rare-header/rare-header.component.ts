import { ChangeDetectionStrategy, Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'dd-header',
  templateUrl: './rare-header.component.html',
  styleUrl: './rare-header.component.scss',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RareHeaderComponent {
  isRareApp = environment.name === 'rare';
}
