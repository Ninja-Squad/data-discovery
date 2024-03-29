import { TestBed } from '@angular/core/testing';

import { FaidareHeaderComponent } from './faidare-header.component';

describe('FaidareHeaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display title and image', () => {
    const fixture = TestBed.createComponent(FaidareHeaderComponent);

    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('FAIR Data-finder for Agronomic REsearch');

    const image = fixture.nativeElement.querySelector('img');
    expect(image).toBeDefined();
  });
});
