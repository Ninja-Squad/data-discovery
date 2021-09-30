import { NgModule } from '@angular/core';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';
import { WheatisHeaderComponent } from './wheatis-header/wheatis-header.component';
import { GenericSelectAllResultsComponent } from '../urgi-common/generic-select-all-results/generic-select-all-results.component';

@NgModule({
  imports: [UrgiCommonModule],
  declarations: [WheatisHeaderComponent],
  exports: [
    GenericDocumentComponent,
    GenericSelectAllResultsComponent,
    WheatisHeaderComponent,
    UrgiCommonModule
  ]
})
export class WheatisModule {}
