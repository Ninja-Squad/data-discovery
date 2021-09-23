import { TestBed } from '@angular/core/testing';

import { GenericDocumentListComponent } from './generic-document-list.component';
import { ComponentTester } from 'ngx-speculoos';
import { By } from '@angular/platform-browser';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { SearchStateService } from '../search-state.service';
import { toSinglePage } from '../models/test-model-generators';
import { of } from 'rxjs';

class GenericDocumentListComponentTester extends ComponentTester<GenericDocumentListComponent> {
  constructor() {
    super(GenericDocumentListComponent);
  }

  get results() {
    return this.debugElement.queryAll(By.directive(GenericDocumentComponent));
  }
}

describe('GenericDocumentListComponent', () => {
  let tester: GenericDocumentListComponentTester;
  let searchStateService: jasmine.SpyObj<SearchStateService>;

  beforeEach(() => {
    searchStateService = jasmine.createSpyObj<SearchStateService>('SearchStateService', [
      'getDocuments'
    ]);
    searchStateService.getDocuments.and.returnValue(
      of(toSinglePage([{ name: 'doc 1', description: 'desc 1', identifier: 'd1', species: [] }]))
    );

    TestBed.configureTestingModule({
      declarations: [
        GenericDocumentListComponent,
        GenericDocumentComponent,
        TruncatableDescriptionComponent
      ],
      providers: [{ provide: SearchStateService, useValue: searchStateService }]
    });
    tester = new GenericDocumentListComponentTester();
    tester.detectChanges();
  });

  it('should list documents', () => {
    expect(tester.results.length).toBe(1);
  });
});
