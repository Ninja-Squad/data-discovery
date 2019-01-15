import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UrgiCommonModule} from "../urgi-common/urgi-common.module";
import { WheatisGnpisDocumentComponent } from './wheatis-gnpis-document/wheatis-gnpis-document.component';

@NgModule({
  imports: [
    CommonModule,
    UrgiCommonModule
  ],
  declarations: [
    WheatisGnpisDocumentComponent
  ],
  exports: [
    WheatisGnpisDocumentComponent,
    CommonModule,
    UrgiCommonModule
  ]
})
export class WheatisGnpisModule { }
