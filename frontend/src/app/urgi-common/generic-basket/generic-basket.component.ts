import { Component } from '@angular/core';

/**
 * Generic basket that doesn't display anything.
 * It's replaced in Rare and Faidare by a specific component
 */
@Component({
  selector: 'dd-basket',
  templateUrl: './generic-basket.component.html',
  styleUrl: './generic-basket.component.scss',
  standalone: true
})
export class GenericBasketComponent {}
