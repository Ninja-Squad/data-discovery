import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'dd-header',
  templateUrl: './wheatis-header.component.html',
  styleUrl: './wheatis-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WheatisHeaderComponent {}
