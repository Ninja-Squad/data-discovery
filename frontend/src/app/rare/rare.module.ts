import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { RareDocumentComponent } from './rare-document/rare-document.component';
import { RareHeaderComponent } from './rare-header/rare-header.component';
import { RareBasketComponent } from './rare-basket/rare-basket.component';

@NgModule({
  imports: [
    CommonModule,
    UrgiCommonModule,
    NgbTooltipModule,
    NgbModalModule
  ],
  declarations: [
    RareDocumentComponent,
    RareHeaderComponent,
    RareBasketComponent
  ],
  exports: [
    RareDocumentComponent,
    RareHeaderComponent,
    RareBasketComponent
  ]
})
export class RareModule {}
