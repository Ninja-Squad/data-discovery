import { TestBed } from '@angular/core/testing';

import { GenericDocumentListComponent } from './generic-document-list.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { GenericDocumentComponent } from '../generic-document/generic-document.component';
import { SearchStateService } from '../../search-state.service';
import { toSinglePage } from '../../models/test-model-generators';
import { of } from 'rxjs';

class GenericDocumentListComponentTester extends ComponentTester<GenericDocumentListComponent> {
  constructor() {
    super(GenericDocumentListComponent);
  }

  get results() {
    return this.elements(GenericDocumentComponent);
  }
}

describe('GenericDocumentListComponent', () => {
  let tester: GenericDocumentListComponentTester;
  let searchStateService: jasmine.SpyObj<SearchStateService>;

  beforeEach(() => {
    searchStateService = createMock(SearchStateService);
    searchStateService.getDocuments.and.returnValue(
      of(toSinglePage([{ name: 'doc 1', description: 'desc 1', identifier: 'd1', species: [] }]))
    );

    TestBed.configureTestingModule({
      providers: [{ provide: SearchStateService, useValue: searchStateService }]
    });
    tester = new GenericDocumentListComponentTester();
    tester.detectChanges();
  });

  it('should list documents', () => {
    expect(tester.results.length).toBe(1);
  });
});
