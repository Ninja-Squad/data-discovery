import { TestBed } from '@angular/core/testing';

import { RareHeaderComponent } from './rare-header.component';

describe('RareHeaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [RareHeaderComponent]
  }));

  it('should display title and image', () => {
    const fixture = TestBed.createComponent(RareHeaderComponent);

    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('RARe');

    const image = fixture.nativeElement.querySelector('img');
    expect(image).toBeDefined();
  });
});
