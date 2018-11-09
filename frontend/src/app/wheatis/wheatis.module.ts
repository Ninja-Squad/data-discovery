import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { WheatisDocumentComponent } from './wheatis-document/wheatis-document.component';
import { WheatisHeaderComponent } from './wheatis-header/wheatis-header.component';

@NgModule({
  imports: [
    CommonModule,
    UrgiCommonModule
  ],
  declarations: [
    WheatisDocumentComponent,
    WheatisHeaderComponent
  ],
  exports: [
    WheatisDocumentComponent,
    WheatisHeaderComponent
  ]
})
export class WheatisModule {}
