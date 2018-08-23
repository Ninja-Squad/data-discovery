import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { WheatisGeneticResourceComponent } from './wheatis-genetic-resource/wheatis-genetic-resource.component';
import { WheatisHeaderComponent } from './wheatis-header/wheatis-header.component';

@NgModule({
  imports: [
    CommonModule,
    UrgiCommonModule
  ],
  declarations: [
    WheatisGeneticResourceComponent,
    WheatisHeaderComponent
  ],
  exports: [
    WheatisGeneticResourceComponent,
    WheatisHeaderComponent
  ]
})
export class WheatisModule {}
