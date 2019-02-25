import { NgModule } from '@angular/core';

import { WheatisGnpisModule } from '../wheatis-gnpis/wheatis-gnpis.module';
import { WheatisGnpisDocumentComponent } from '../wheatis-gnpis/wheatis-gnpis-document/wheatis-gnpis-document.component';
import { WheatisHeaderComponent } from './wheatis-header/wheatis-header.component';

@NgModule({
  imports: [
    WheatisGnpisModule
  ],
  declarations: [
    WheatisHeaderComponent
  ],
  exports: [
    WheatisGnpisDocumentComponent,
    WheatisHeaderComponent
  ]
})
export class WheatisModule {}
