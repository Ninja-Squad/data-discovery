import { NgModule } from '@angular/core';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';
import { WheatisHeaderComponent } from './wheatis-header/wheatis-header.component';

@NgModule({
  imports: [
    UrgiCommonModule
  ],
  declarations: [
    WheatisHeaderComponent
  ],
  exports: [
    GenericDocumentComponent,
    WheatisHeaderComponent
  ]
})
export class WheatisModule {}
