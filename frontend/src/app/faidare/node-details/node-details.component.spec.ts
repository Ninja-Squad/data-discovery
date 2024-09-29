import { NodeDetailsComponent } from './node-details.component';
import { Component } from '@angular/core';
import { TypedNodeDetails } from '../ontology.model';
import { ComponentTester } from 'ngx-speculoos';
import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

@Component({
  template: '<dd-node-details [node]="node" />',
  standalone: true,
  imports: [NodeDetailsComponent]
})
class TestComponent {
  node: TypedNodeDetails = {
    type: 'ONTOLOGY',
    details: {
      ontologyName: 'Test 1',
      links: []
    }
  } as TypedNodeDetails;
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get nodeDetailsComponent(): NodeDetailsComponent {
    return this.component(NodeDetailsComponent);
  }
}

describe('NodeDetailsComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });

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
        name: 'Test 1',
        synonyms: [],
        alternativeAbbreviations: []
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
        synonyms: [],
        contextOfUse: [],
        trait: {
          name: 'Trait 1',
          synonyms: [],
          alternativeAbbreviations: []
        }
      }
    } as TypedNodeDetails;
    tester.detectChanges();

    expect(tester.testElement).toContainText('Test 1');
    expect(tester.testElement).toContainText('Variable');
  });

  it('should tell if a value is a URL or not', () => {
    expect(tester.nodeDetailsComponent.isUrl('foo')).toBeFalse();
    expect(tester.nodeDetailsComponent.isUrl('http://foo.com')).toBeTrue();
    expect(tester.nodeDetailsComponent.isUrl('https://foo.com')).toBeTrue();
  });
});
