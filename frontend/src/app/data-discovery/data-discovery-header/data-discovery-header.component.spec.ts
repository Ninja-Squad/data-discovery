import { TestBed } from '@angular/core/testing';

import { DataDiscoveryHeaderComponent } from './data-discovery-header.component';

describe('DataDiscoveryHeaderComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [DataDiscoveryHeaderComponent]
    })
  );

  it('should display title and image', () => {
    const fixture = TestBed.createComponent(DataDiscoveryHeaderComponent);

    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('DataDiscovery');

    const image = fixture.nativeElement.querySelector('img');
    expect(image).toBeDefined();
  });
});
