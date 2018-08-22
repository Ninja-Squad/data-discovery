import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RareGeneticResourceComponent } from './rare-genetic-resource/rare-genetic-resource.component';
import { UrgiCommonModule } from '../urgi-common/urgi-common.module';

@NgModule({
  imports: [
    CommonModule,
    UrgiCommonModule
  ],
  declarations: [
    RareGeneticResourceComponent
  ],
  exports: [
    RareGeneticResourceComponent
  ]
})
export class RareModule {}
