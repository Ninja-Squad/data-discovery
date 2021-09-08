import { TestBed } from '@angular/core/testing';

import { GenericDocumentListComponent } from './generic-document-list.component';
import { ComponentTester } from 'ngx-speculoos';
import { By } from '@angular/platform-browser';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';
import { Component } from '@angular/core';
import { Aggregation, Page } from '../models/page';
import { DocumentModel } from '../models/document.model';
import { toSinglePage } from '../models/test-model-generators';

@Component({
  template:
    '<dd-document-list [documents]="documents" [aggregations]="aggregations"></dd-document-list>'
})
class TestComponent {
  documents: Page<DocumentModel> = toSinglePage([
    { name: 'doc 1', description: 'desc 1', identifier: 'd1', species: [] }
  ]);
  aggregations: Array<Aggregation> = [];
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get results() {
    return this.debugElement.queryAll(By.directive(GenericDocumentComponent));
  }
}

describe('GenericDocumentListComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, GenericDocumentListComponent, GenericDocumentComponent]
    });
    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('list documents', () => {
    expect(tester.results.length).toBe(1);
  });
});
