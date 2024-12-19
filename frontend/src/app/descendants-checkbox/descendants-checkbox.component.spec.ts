import { TestBed } from '@angular/core/testing';

import { DescendantsCheckboxComponent } from './descendants-checkbox.component';
import { ComponentTester } from 'ngx-speculoos';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideI18nTesting } from '../i18n/mock-18n.spec';

@Component({
  template:
    '<dd-descendants-checkbox [searchDescendants]="value()" (searchDescendantsChange)="onChange($event)" />',
  imports: [DescendantsCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  value = signal(true);
  eventReceived = signal<boolean | null>(null);

  onChange(event: boolean) {
    this.eventReceived.set(event);
  }
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get label() {
    return this.element('label')!;
  }

  get checkbox() {
    return this.input('input')!;
  }
}

describe('DescendantsCheckboxComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });
    tester = new TestComponentTester();
    await tester.stable();
  });

  it('should display a checkbox and emit changes', async () => {
    expect(tester.label).toHaveText('Expand search');
    expect(tester.checkbox).toBeChecked();
    // no event
    expect(tester.componentInstance.eventReceived()).toBe(null);

    // uncheck
    await tester.checkbox.uncheck();
    expect(tester.checkbox).not.toBeChecked();
    expect(tester.componentInstance.eventReceived()).toBe(false);

    // check
    await tester.checkbox.check();
    expect(tester.checkbox).toBeChecked();
    expect(tester.componentInstance.eventReceived()).toBe(true);

    // change input value
    tester.componentInstance.value.set(false);
    await tester.stable();
    expect(tester.checkbox).not.toBeChecked();
  });
});
