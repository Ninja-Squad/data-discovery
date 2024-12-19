import { TestBed } from '@angular/core/testing';

import { OntologyNodeTypeComponent } from './ontology-node-type.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentTester } from 'ngx-speculoos';
import { OntologyNodeType } from '../../ontology.service';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

@Component({
  template: '<dd-ontology-node-type [type]="type()" />',
  imports: [OntologyNodeTypeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  type = signal<OntologyNodeType>('ONTOLOGY');
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }
}

describe('OntologyNodeTypeComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });
    tester = new TestComponentTester();
    await tester.stable();
  });

  it('should display an ontology type', async () => {
    const element = tester.element('span');
    expect(element).toContainText('Ontology');
    expect(element).toHaveClass('badge-ONTOLOGY');

    tester.componentInstance.type.set('TRAIT');
    await tester.stable();

    expect(element).toContainText('Trait');
    expect(element).toHaveClass('badge-TRAIT');
  });
});
