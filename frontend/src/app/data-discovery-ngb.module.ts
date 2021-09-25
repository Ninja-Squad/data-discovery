import { NgModule } from '@angular/core';
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbTooltipModule,
  NgbTypeaheadModule
} from '@ng-bootstrap/ng-bootstrap';

const NGB_MODULES = [
  NgbTooltipModule,
  NgbTypeaheadModule,
  NgbPaginationModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbNavModule
];

/**
 * A module which imports all the needed ng-bootstrap modules for the application
 */
@NgModule({
  imports: NGB_MODULES,
  exports: NGB_MODULES
})
export class DataDiscoveryNgbModule {}
