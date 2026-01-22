import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

import { DescendantsCheckboxComponent } from './descendants-checkbox.component';
import { provideI18nTesting } from '../i18n/mock-18n';

@Component({
  template:
    '<dd-descendants-checkbox [searchDescendants]="value()" (searchDescendantsChange)="onChange($event)" />',
  imports: [DescendantsCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-descendants-checkbox-tester'
})
class TestComponent {
  readonly value = signal(true);
  readonly eventReceived = signal<boolean | null>(null);

  onChange(event: boolean) {
    this.eventReceived.set(event);
  }
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly label = page.getByCss('label');
  readonly checkbox = page.getByCss('input');
}

describe('DescendantsCheckboxComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });
    tester = new TestComponentTester();
    await tester.fixture.whenStable();
  });

  test('should display a checkbox and emit changes', async () => {
    await expect.element(tester.label).toHaveTextContent('Expand search');
    await expect.element(tester.checkbox).toBeChecked();
    // no event
    expect(tester.componentInstance.eventReceived()).toBe(null);

    // uncheck
    await tester.checkbox.click();
    await expect.element(tester.checkbox).not.toBeChecked();
    expect(tester.componentInstance.eventReceived()).toBe(false);

    // check
    await tester.checkbox.click();
    await expect.element(tester.checkbox).toBeChecked();
    expect(tester.componentInstance.eventReceived()).toBe(true);

    // change input value
    tester.componentInstance.value.set(false);
    await tester.fixture.whenStable();
    await expect.element(tester.checkbox).not.toBeChecked();
  });
});
