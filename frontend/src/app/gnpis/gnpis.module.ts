import { NgModule } from '@angular/core';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';
import { GnpisHeaderComponent } from './gnpis-header/gnpis-header.component';

@NgModule({
  imports: [
    UrgiCommonModule
  ],
  declarations: [
    GnpisHeaderComponent
  ],
  exports: [
    GenericDocumentComponent,
    GnpisHeaderComponent
  ]
})
export class GnpisModule {}
