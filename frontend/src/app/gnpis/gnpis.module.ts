import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { GnpisDocumentComponent } from './gnpis-document/gnpis-document.component';
import { GnpisHeaderComponent } from './gnpis-header/gnpis-header.component';

@NgModule({
  imports: [
    CommonModule,
    UrgiCommonModule
  ],
  declarations: [
    GnpisDocumentComponent,
    GnpisHeaderComponent
  ],
  exports: [
    GnpisDocumentComponent,
    GnpisHeaderComponent
  ]
})
export class GnpisModule {}
