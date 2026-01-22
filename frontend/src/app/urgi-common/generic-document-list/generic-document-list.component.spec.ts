import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';
import { createMock, MockObject } from '../../../test/mock';

import { GenericDocumentListComponent } from './generic-document-list.component';
import { SearchStateService } from '../../search-state.service';
import { toSinglePage } from '../../models/test-model-generators';
import { of } from 'rxjs';

class GenericDocumentListComponentTester {
  constructor() {
    TestBed.createComponent(GenericDocumentListComponent);
  }
  readonly results = page.getByCss('dd-document');
}

describe('GenericDocumentListComponent', () => {
  let tester: GenericDocumentListComponentTester;
  let searchStateService: MockObject<SearchStateService>;

  beforeEach(async () => {
    searchStateService = createMock(SearchStateService);
    searchStateService.getDocuments.mockReturnValue(
      of(toSinglePage([{ name: 'doc 1', description: 'desc 1', identifier: 'd1', species: [] }]))
    );

    TestBed.configureTestingModule({
      providers: [{ provide: SearchStateService, useValue: searchStateService }]
    });
    tester = new GenericDocumentListComponentTester();
  });

  test('should list documents', async () => {
    await expect.element(tester.results).toHaveLength(1);
  });
});
