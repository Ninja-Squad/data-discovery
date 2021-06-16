import { TestBed } from '@angular/core/testing';

import { WheatisHeaderComponent } from './wheatis-header.component';

describe('WheatisHeaderComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [WheatisHeaderComponent]
    })
  );

  it('should display title and image', () => {
    const fixture = TestBed.createComponent(WheatisHeaderComponent);

    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('WheatIS');

    const image = fixture.nativeElement.querySelector('img');
    expect(image).toBeDefined();
  });
});
