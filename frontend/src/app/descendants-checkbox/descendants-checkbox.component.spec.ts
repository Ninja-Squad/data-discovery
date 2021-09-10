import { TestBed } from '@angular/core/testing';

import { DescendantsCheckboxComponent } from './descendants-checkbox.component';
import { DataDiscoveryNgbTestingModule } from '../data-discovery-ngb-testing.module';
import { ComponentTester } from 'ngx-speculoos';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';
import { Component } from '@angular/core';

@Component({
  template:
    '<dd-descendants-checkbox [searchDescendants]="value" (searchDescendantsChange)="onChange($event)"></dd-descendants-checkbox>'
})
class TestComponent {
  value = true;
  eventReceived: boolean | null = null;

  onChange(event: boolean) {
    this.eventReceived = event;
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DescendantsCheckboxComponent],
      imports: [DataDiscoveryNgbTestingModule, I18nTestingModule]
    });
    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should display a checkbox and emit changes', () => {
    expect(tester.label).toHaveText('Expand search');
    expect(tester.checkbox).toBeChecked();
    // no event
    expect(tester.componentInstance.eventReceived).toBe(null);

    // uncheck
    tester.checkbox.uncheck();
    expect(tester.checkbox).not.toBeChecked();
    expect(tester.componentInstance.eventReceived).toBe(false);

    // check
    tester.checkbox.check();
    expect(tester.checkbox).toBeChecked();
    expect(tester.componentInstance.eventReceived).toBe(true);

    // change input value
    tester.componentInstance.value = false;
    tester.detectChanges();
    expect(tester.checkbox).not.toBeChecked();
  });
});
