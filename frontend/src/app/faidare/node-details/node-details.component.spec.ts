import { NodeDetailsComponent } from './node-details.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TypedNodeDetails } from '../ontology.model';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { By } from '@angular/platform-browser';

@Component({
  template: '<dd-node-details [node]="node()" />',
  imports: [NodeDetailsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-node-details-tester'
})
class TestComponent {
  readonly node = signal<TypedNodeDetails>({
    type: 'ONTOLOGY',
    details: {
      ontologyName: 'Test 1',
      links: []
    }
  } as TypedNodeDetails);
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly root = page.elementLocator(this.fixture.nativeElement);
  get nodeDetailsComponent(): NodeDetailsComponent {
    return this.fixture.debugElement.query(By.directive(NodeDetailsComponent))
      ?.componentInstance as NodeDetailsComponent;
  }
}

describe('NodeDetailsComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });

    tester = new TestComponentTester();
    await tester.fixture.whenStable();
  });

  test('should display an ontology', async () => {
    await expect.element(tester.root).toHaveTextContent('Test 1');
    await expect.element(tester.root).toHaveTextContent('Ontology');
  });

  test('should display a trait class', async () => {
    tester.componentInstance.node.set({
      type: 'TRAIT_CLASS',
      details: {
        name: 'Test 1'
      }
    } as TypedNodeDetails);
    await tester.fixture.whenStable();

    await expect.element(tester.root).toHaveTextContent('Test 1');
    await expect.element(tester.root).toHaveTextContent('Trait class');
  });

  test('should display a trait', async () => {
    tester.componentInstance.node.set({
      type: 'TRAIT',
      details: {
        name: 'Test 1',
        synonyms: [],
        alternativeAbbreviations: []
      }
    } as TypedNodeDetails);
    await tester.fixture.whenStable();

    await expect.element(tester.root).toHaveTextContent('Test 1');
    await expect.element(tester.root).toHaveTextContent('Trait');
  });

  test('should display a variable', async () => {
    tester.componentInstance.node.set({
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
    } as TypedNodeDetails);
    await tester.fixture.whenStable();

    await expect.element(tester.root).toHaveTextContent('Test 1');
    await expect.element(tester.root).toHaveTextContent('Variable');
  });

  test('should tell if a value is a URL or not', () => {
    expect(tester.nodeDetailsComponent.isUrl('foo')).toBe(false);
    expect(tester.nodeDetailsComponent.isUrl('http://foo.com')).toBe(true);
    expect(tester.nodeDetailsComponent.isUrl('https://foo.com')).toBe(true);
  });
});
