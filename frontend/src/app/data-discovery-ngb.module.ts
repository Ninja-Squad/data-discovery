import { NgModule } from '@angular/core';
import {
  NgbPaginationModule,
  NgbTooltipModule,
  NgbTypeaheadModule
} from '@ng-bootstrap/ng-bootstrap';

const NGB_MODULES = [NgbTooltipModule, NgbTypeaheadModule, NgbPaginationModule];

/**
 * A module which imports all the needed ng-bootstrap modules for the application
 */
@NgModule({
  imports: NGB_MODULES,
  exports: NGB_MODULES
})
export class DataDiscoveryNgbModule {}
