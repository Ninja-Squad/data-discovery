import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

import { OntologyNodeTypeComponent } from './ontology-node-type.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { OntologyNodeType } from '../../ontology.service';
import { provideI18nTesting } from '../../i18n/mock-18n';

@Component({
  template: '<dd-ontology-node-type [type]="type()" />',
  imports: [OntologyNodeTypeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-ontology-node-type-tester'
})
class TestComponent {
  readonly type = signal<OntologyNodeType>('ONTOLOGY');
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly element = page.getByCss('span');
}

describe('OntologyNodeTypeComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });
    tester = new TestComponentTester();
    await tester.fixture.whenStable();
  });

  test('should display an ontology type', async () => {
    await expect.element(tester.element).toHaveTextContent('Ontology');
    await expect.element(tester.element).toHaveClass('badge-ONTOLOGY');

    tester.componentInstance.type.set('TRAIT');
    await tester.fixture.whenStable();

    await expect.element(tester.element).toHaveTextContent('Trait');
    await expect.element(tester.element).toHaveClass('badge-TRAIT');
  });
});
