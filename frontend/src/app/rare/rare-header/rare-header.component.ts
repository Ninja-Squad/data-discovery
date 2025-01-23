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
  // not readonly for testing purposes
  isRareApp = environment.name === 'rare';
}
