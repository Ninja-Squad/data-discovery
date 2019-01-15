import { Component, Input } from '@angular/core';

import { WheatisGnpisDocumentModel } from '../wheatis-gnpis-document.model';

@Component({
  selector: 'dd-document',
  templateUrl: './wheatis-gnpis-document.component.html',
  styleUrls: ['./wheatis-gnpis-document.component.scss']
})
export class WheatisGnpisDocumentComponent {

  @Input() document: WheatisGnpisDocumentModel;

}
