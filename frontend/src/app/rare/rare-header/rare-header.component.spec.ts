import { TestBed } from '@angular/core/testing';

import { RareHeaderComponent } from './rare-header.component';

describe('RareHeaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display title and image for rare', () => {
    const fixture = TestBed.createComponent(RareHeaderComponent);

    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('RARe');

    const image = fixture.nativeElement.querySelector('img');
    expect(image).toBeDefined();
  });

  it('should display title and image for application other than rare', () => {
    const fixture = TestBed.createComponent(RareHeaderComponent);
    fixture.componentInstance.isRareApp = false;

    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('BRC4EnvBiological');

    const image = fixture.nativeElement.querySelector('img');
    expect(image).toBeDefined();
  });
});
