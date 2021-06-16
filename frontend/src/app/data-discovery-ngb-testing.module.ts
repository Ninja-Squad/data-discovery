import { NgModule } from '@angular/core';
import { NgbConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataDiscoveryNgbModule } from './data-discovery-ngb.module';

/**
 * A module for unit tests, which imports DataDiscoveryNgbModule and disables animations
 */
@NgModule({
  imports: [DataDiscoveryNgbModule],
  exports: [DataDiscoveryNgbModule]
})
export class DataDiscoveryNgbTestingModule {
  constructor(ngbConfig: NgbConfig) {
    ngbConfig.animation = false;
  }
}
