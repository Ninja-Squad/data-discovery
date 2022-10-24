import { Component } from '@angular/core';

/**
 * Generic basket that doesn't display anything.
 * It's replaced in Rare and Faidare by a specific component
 */
@Component({
  selector: 'dd-basket',
  templateUrl: './generic-basket.component.html',
  styleUrls: ['./generic-basket.component.scss']
})
export class GenericBasketComponent {}
