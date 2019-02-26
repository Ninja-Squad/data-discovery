import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDocumentComponent } from './generic-document/generic-document.component';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TruncatableDescriptionComponent,
    GenericDocumentComponent
  ],
  exports: [
    TruncatableDescriptionComponent,
    GenericDocumentComponent,
    CommonModule
  ]
})
export class UrgiCommonModule { }
