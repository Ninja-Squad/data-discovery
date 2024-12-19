import { TestBed } from '@angular/core/testing';

import { GenericSelectAllResultsComponent } from './generic-select-all-results.component';
import { ComponentTester } from 'ngx-speculoos';

describe('GenericSelectAllResultsComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({}));
  it('should be empty', async () => {
    const tester = ComponentTester.create(GenericSelectAllResultsComponent);
    await tester.stable();
    expect(tester.testElement).toHaveText('');
  });
});
