import { InjectionToken, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { UrgiCommonModule } from '../urgi-common/urgi-common.module';
import { RareDocumentComponent } from './rare-document/rare-document.component';
import { RareHeaderComponent } from './rare-header/rare-header.component';
import { RareBasketComponent } from './rare-basket/rare-basket.component';
import { I18nModule } from '../i18n/i18n.module';

export const LOCATION = new InjectionToken<Location>('Location');

@NgModule({
  imports: [
    CommonModule,
    UrgiCommonModule,
    NgbTooltipModule,
    NgbModalModule,
    I18nModule
  ],
  declarations: [
    RareDocumentComponent,
    RareHeaderComponent,
    RareBasketComponent
  ],
  providers: [
    { provide: LOCATION, useValue: window.location }
  ],
  exports: [
    RareDocumentComponent,
    RareHeaderComponent,
    RareBasketComponent
  ]
})
export class RareModule {}
