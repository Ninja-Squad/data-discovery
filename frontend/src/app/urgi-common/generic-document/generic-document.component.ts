import { Component, Input } from '@angular/core';

import { GenericDocumentModel } from '../generic-document.model';

@Component({
  selector: 'dd-document',
  templateUrl: './generic-document.component.html',
  styleUrls: ['./generic-document.component.scss']
})
export class GenericDocumentComponent {

  @Input() document!: GenericDocumentModel;

}
