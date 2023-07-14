import { TestBed } from '@angular/core/testing';

import { OntologyNodeTypeComponent } from './ontology-node-type.component';
import { Component } from '@angular/core';
import { ComponentTester } from 'ngx-speculoos';
import { OntologyNodeType } from '../../ontology.service';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

@Component({
  template: '<dd-ontology-node-type [type]="type"></dd-ontology-node-type>',
  standalone: true,
  imports: [OntologyNodeTypeComponent]
})
class TestComponent {
  type: OntologyNodeType = 'ONTOLOGY';
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }
}

describe('OntologyNodeTypeComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });
    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should display an ontology type', () => {
    const element = tester.element('span');
    expect(element).toContainText('Ontology');
    expect(element).toHaveClass('badge-ONTOLOGY');

    tester.componentInstance.type = 'TRAIT';
    tester.detectChanges();

    expect(element).toContainText('Trait');
    expect(element).toHaveClass('badge-TRAIT');
  });
});
