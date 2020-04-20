import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDocumentComponent } from './generic-document/generic-document.component';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { I18nModule } from '../i18n/i18n.module';
import { GenericSelectAllResultsComponent } from './generic-select-all-results/generic-select-all-results.component';

@NgModule({
  imports: [
    CommonModule,
    I18nModule
  ],
  declarations: [
    TruncatableDescriptionComponent,
    GenericDocumentComponent,
    GenericSelectAllResultsComponent
  ],
  exports: [
    TruncatableDescriptionComponent,
    GenericDocumentComponent,
    GenericSelectAllResultsComponent,
    CommonModule
  ]
})
export class UrgiCommonModule {}
