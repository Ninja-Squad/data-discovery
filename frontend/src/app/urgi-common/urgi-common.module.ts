import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TruncatableDescriptionComponent
  ],
  exports: [
    TruncatableDescriptionComponent
  ]
})
export class UrgiCommonModule { }
