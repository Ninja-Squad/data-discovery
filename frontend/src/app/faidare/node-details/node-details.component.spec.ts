import { NodeDetailsComponent } from './node-details.component';
import { Component } from '@angular/core';
import { TypedNodeDetails } from '../ontology.model';
import { ComponentTester } from 'ngx-speculoos';
import { TestBed } from '@angular/core/testing';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { OntologyNodeTypeComponent } from '../ontology-node-type/ontology-node-type.component';

@Component({
  template: '<dd-node-details [node]="node"></dd-node-details>'
})
class TestComponent {
  node: TypedNodeDetails = {
    type: 'ONTOLOGY',
    details: {
      ontologyName: 'Test 1'
    }
  } as TypedNodeDetails;
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }
}

describe('NodeDetailsComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [TestComponent, NodeDetailsComponent, OntologyNodeTypeComponent]
    });

    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should display an ontology', () => {
    expect(tester.testElement).toContainText('Test 1');
    expect(tester.testElement).toContainText('Ontology');
  });

  it('should display a trait class', () => {
    tester.componentInstance.node = {
      type: 'TRAIT_CLASS',
      details: {
        name: 'Test 1'
      }
    } as TypedNodeDetails;
    tester.detectChanges();

    expect(tester.testElement).toContainText('Test 1');
    expect(tester.testElement).toContainText('Trait class');
  });

  it('should display a trait', () => {
    tester.componentInstance.node = {
      type: 'TRAIT',
      details: {
        name: 'Test 1'
      }
    } as TypedNodeDetails;
    tester.detectChanges();

    expect(tester.testElement).toContainText('Test 1');
    expect(tester.testElement).toContainText('Trait');
  });

  it('should display a variable', () => {
    tester.componentInstance.node = {
      type: 'VARIABLE',
      details: {
        name: 'Test 1',
        trait: {
          name: 'Trait 1'
        }
      }
    } as TypedNodeDetails;
    tester.detectChanges();

    expect(tester.testElement).toContainText('Test 1');
    expect(tester.testElement).toContainText('Variable');
  });
});
