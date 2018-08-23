import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { RareGeneticResourceComponent } from './rare-genetic-resource/rare-genetic-resource.component';
import { RareHeaderComponent } from './rare-header/rare-header.component';

@NgModule({
  imports: [
    CommonModule,
    UrgiCommonModule
  ],
  declarations: [
    RareGeneticResourceComponent,
    RareHeaderComponent
  ],
  exports: [
    RareGeneticResourceComponent,
    RareHeaderComponent
  ]
})
export class RareModule {}
