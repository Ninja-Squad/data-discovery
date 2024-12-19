import { TestBed } from '@angular/core/testing';

import { FaidareHeaderComponent } from './faidare-header.component';
import { ComponentTester } from 'ngx-speculoos';

describe('FaidareHeaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display title and image', async () => {
    const tester = ComponentTester.create(FaidareHeaderComponent);

    await tester.stable();

    const title = tester.element('h1');
    expect(title).toContainText('FAIR Data-finder for Agronomic REsearch');
  });
});
