import { NgModule } from '@angular/core';

import { WheatisGnpisModule } from '../wheatis-gnpis/wheatis-gnpis.module';
import { WheatisGnpisDocumentComponent } from '../wheatis-gnpis/wheatis-gnpis-document/wheatis-gnpis-document.component';
import { GnpisHeaderComponent } from './gnpis-header/gnpis-header.component';

@NgModule({
  imports: [
    WheatisGnpisModule
  ],
  declarations: [
    GnpisHeaderComponent
  ],
  exports: [
    WheatisGnpisDocumentComponent,
    GnpisHeaderComponent
  ]
})
export class GnpisModule {}
