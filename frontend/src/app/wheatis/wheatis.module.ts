import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WheatisGeneticResourceComponent } from './wheatis-genetic-resource/wheatis-genetic-resource.component';
import { UrgiCommonModule } from '../urgi-common/urgi-common.module';

@NgModule({
  imports: [
    CommonModule,
    UrgiCommonModule
  ],
  declarations: [
    WheatisGeneticResourceComponent
  ],
  exports: [
    WheatisGeneticResourceComponent
  ]
})
export class WheatisModule {}
