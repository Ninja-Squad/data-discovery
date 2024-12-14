import { Component, input } from '@angular/core';
import { GenericDocumentModel } from '../generic-document.model';
import { Page } from '../../models/page';

/**
 * Generic component used to select all the search results.
 * The default version does nothing and is empty.
 * RareModule provides its own version, with the same selector,
 * allowing to add/remove all results to/from the basket.
 */
@Component({
  selector: 'dd-select-all-results',
  templateUrl: './generic-select-all-results.component.html',
  styleUrl: './generic-select-all-results.component.scss'
})
export class GenericSelectAllResultsComponent {
  readonly documents = input.required<Page<GenericDocumentModel>>();
}
