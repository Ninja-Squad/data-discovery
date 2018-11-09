import { Component, Input } from '@angular/core';

import { WheatisDocumentModel } from '../wheatis-document.model';

@Component({
  selector: 'dd-document',
  templateUrl: './wheatis-document.component.html',
  styleUrls: ['./wheatis-document.component.scss']
})
export class WheatisDocumentComponent {

  @Input() document: WheatisDocumentModel;

}
