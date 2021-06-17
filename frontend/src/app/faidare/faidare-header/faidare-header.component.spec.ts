import { TestBed } from '@angular/core/testing';

import { FaidareHeaderComponent } from './faidare-header.component';

describe('FaidareHeaderComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [FaidareHeaderComponent]
    })
  );

  it('should display title and image', () => {
    const fixture = TestBed.createComponent(FaidareHeaderComponent);

    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('DataDiscovery');

    const image = fixture.nativeElement.querySelector('img');
    expect(image).toBeDefined();
  });
});
