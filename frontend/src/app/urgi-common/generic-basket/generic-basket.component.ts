import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Generic basket that doesn't display anything.
 * It's replaced in Rare and Faidare by a specific component
 */
@Component({
  selector: 'dd-basket',
  templateUrl: './generic-basket.component.html',
  styleUrl: './generic-basket.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericBasketComponent {}
