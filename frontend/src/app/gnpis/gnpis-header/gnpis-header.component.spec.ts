import { TestBed } from '@angular/core/testing';

import { GnpisHeaderComponent } from './gnpis-header.component';

describe('GnpisHeaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [GnpisHeaderComponent]
  }));

  it('should display title and image', () => {
    const fixture = TestBed.createComponent(GnpisHeaderComponent);

    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('GnpIS');

    const image = fixture.nativeElement.querySelector('img');
    expect(image).toBeDefined();
  });
});
