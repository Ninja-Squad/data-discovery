import { TestBed } from '@angular/core/testing';

import { GenericSelectAllResultsComponent } from './generic-select-all-results.component';

describe('GenericSelectAllResultsComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
      declarations: [GenericSelectAllResultsComponent]
    }));
  it('should be empty', () => {
    const fixture = TestBed.createComponent(GenericSelectAllResultsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('');
  });
});
