import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'dd-header',
  templateUrl: './faidare-header.component.html',
  styleUrl: './faidare-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareHeaderComponent {}
