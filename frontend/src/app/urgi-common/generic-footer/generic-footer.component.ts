import { Component } from '@angular/core';

/**
 * Generic footer that doesn't display anything.
 * It's replaced in Faidare (at least) by a specific footer
 */
@Component({
  selector: 'dd-footer',
  templateUrl: './generic-footer.component.html',
  styleUrls: ['./generic-footer.component.scss']
})
export class GenericFooterComponent {}
