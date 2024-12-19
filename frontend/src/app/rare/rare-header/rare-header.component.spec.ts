import { TestBed } from '@angular/core/testing';

import { RareHeaderComponent } from './rare-header.component';
import { ComponentTester } from 'ngx-speculoos';

describe('RareHeaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display title and image for rare', async () => {
    const tester = ComponentTester.create(RareHeaderComponent);

    await tester.stable();

    const title = tester.element('h1');
    expect(title).toContainText('RARe');

    const image = tester.element('img');
    expect(image).not.toBeNull();
  });

  it('should display title and image for application other than rare', async () => {
    const tester = ComponentTester.create(RareHeaderComponent);
    tester.componentInstance.isRareApp = false;

    await tester.stable();

    const title = tester.element('h1');
    expect(title).toContainText('BRC4EnvBiological');

    const image = tester.element('img');
    expect(image).not.toBeNull();
  });
});
