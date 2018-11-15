import { Component, Input } from '@angular/core';

import { GnpisDocumentModel } from '../gnpis-document.model';

@Component({
  selector: 'dd-document',
  templateUrl: './gnpis-document.component.html',
  styleUrls: ['./gnpis-document.component.scss']
})
export class GnpisDocumentComponent {

  @Input() document: GnpisDocumentModel;

}
