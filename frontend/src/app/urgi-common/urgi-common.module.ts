import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDocumentComponent } from './generic-document/generic-document.component';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { I18nModule } from '../i18n/i18n.module';

@NgModule({
  imports: [
    CommonModule,
    I18nModule
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
export class UrgiCommonModule {}
