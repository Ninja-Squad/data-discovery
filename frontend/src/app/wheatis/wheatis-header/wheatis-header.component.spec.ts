import { TestBed } from '@angular/core/testing';

import { WheatisHeaderComponent } from './wheatis-header.component';
import { ComponentTester } from 'ngx-speculoos';

describe('WheatisHeaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display title and image', async () => {
    const tester = ComponentTester.create(WheatisHeaderComponent);

    await tester.stable();

    const title = tester.element('h1');
    expect(title).toContainText('WheatIS');

    const image = tester.element('img');
    expect(image).not.toBeNull();
  });
});
