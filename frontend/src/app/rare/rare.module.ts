import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { RareDocumentComponent } from './rare-document/rare-document.component';
import { RareHeaderComponent } from './rare-header/rare-header.component';

@NgModule({
  imports: [
    CommonModule,
    UrgiCommonModule
  ],
  declarations: [
    RareDocumentComponent,
    RareHeaderComponent
  ],
  exports: [
    RareDocumentComponent,
    RareHeaderComponent
  ]
})
export class RareModule {}
