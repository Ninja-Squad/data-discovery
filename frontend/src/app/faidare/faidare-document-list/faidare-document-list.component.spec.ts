import { TestBed } from '@angular/core/testing';

import {
  FaidareDocumentListComponent,
  toAllTransition,
  toGermplasmTransition
} from './faidare-document-list.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { GenericDocumentComponent } from '../../urgi-common/generic-document/generic-document.component';
import { Aggregation } from '../../models/page';
import { NgbNavLink } from '@ng-bootstrap/ng-bootstrap';
import { ReplaySubject } from 'rxjs';
import { Model, SearchCriteria, SearchStateService } from '../../search-state.service';
import { toSinglePage } from '../../models/test-model-generators';
import { DocumentModel } from '../../models/document.model';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';
import { provideDisabledNgbAnimation } from '../../disable-animations';
import { GermplasmResultsComponent } from '../germplasm-results/germplasm-results.component';

class FaidareDocumentListComponentTester extends ComponentTester<FaidareDocumentListComponent> {
  constructor() {
    super(FaidareDocumentListComponent);
  }

  get documents() {
    return this.elements(GenericDocumentComponent);
  }

  get germplasmResults() {
    return this.element(GermplasmResultsStubComponent);
  }

  get tabs() {
    return this.elements(NgbNavLink);
  }

  get firstTab() {
    return this.element('a')!;
  }

  get secondTab() {
    return this.elements('a')[1];
  }
}

@Component({
  selector: 'dd-germplasm-results',
  template: 'Germplasm Results here'
})
class GermplasmResultsStubComponent {}

describe('FaidareDocumentListComponent', () => {
  let tester: FaidareDocumentListComponentTester;
  let modelSubject: ReplaySubject<Model>;
  let searchStateService: jasmine.SpyObj<SearchStateService>;

  beforeEach(() => {
    modelSubject = new ReplaySubject<Model>(1);
    searchStateService = createMock(SearchStateService);
    searchStateService.getModel.and.returnValue(modelSubject);

    // use a stub for germplasm results
    TestBed.overrideComponent(FaidareDocumentListComponent, {
      remove: {
        imports: [GermplasmResultsComponent]
      },
      add: {
        imports: [GermplasmResultsStubComponent]
      }
    });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
        provideDisabledNgbAnimation(),
        {
          provide: SearchStateService,
          useValue: searchStateService
        }
      ]
    });
    tester = new FaidareDocumentListComponentTester();
  });

  it('should list documents if no germplasm', () => {
    const model: Model = {
      documents: toSinglePage<DocumentModel>([
        {
          name: 'doc 1',
          description: 'desc 1',
          identifier: 'd1',
          species: []
        } as DocumentModel
      ]),
      aggregations: [] as Array<Aggregation>,
      searchCriteria: {
        fragment: null
      }
    } as Model;
    modelSubject.next(model);
    tester.detectChanges();

    expect(tester.documents.length).toBe(1);
    // no germplasm tab
    expect(tester.tabs.length).toBe(0);
  });

  it('should list documents in a germplasm tab if there is a germplasm document', () => {
    // given one entry aggregation, with one document of type germplasm
    const entry: Aggregation = {
      name: 'entry',
      type: 'SMALL',
      buckets: [{ key: 'Germplasm', documentCount: 1 }]
    };
    const model: Model = {
      documents: toSinglePage<DocumentModel>([
        {
          name: 'doc 1',
          description: 'desc 1',
          identifier: 'd1',
          species: []
        } as DocumentModel
      ]),
      aggregations: [entry],
      searchCriteria: {
        fragment: null
      }
    } as Model;
    modelSubject.next(model);
    tester.detectChanges();

    // then we have a germplasm tab
    expect(tester.tabs.length).toBe(2);
    // first tab is All and is active
    expect(tester.firstTab).toHaveText('All');
    expect(tester.secondTab).toHaveText('Germplasm');
    expect(tester.documents.length).toBe(1);
    expect(tester.germplasmResults).toBeNull();
    expect(searchStateService.disableAggregation).toHaveBeenCalledWith(null);

    tester.secondTab.click();
    expect(tester.documents.length).toBe(0);
    expect(tester.germplasmResults).toBeNull();
    expect(searchStateService.applyTransition).toHaveBeenCalledWith(toGermplasmTransition);

    modelSubject.next({
      ...model,
      searchCriteria: {
        fragment: 'germplasm'
      }
    } as Model);
    tester.detectChanges();

    searchStateService.applyTransition.calls.reset();
    expect(tester.germplasmResults).not.toBeNull();

    tester.firstTab.click();
    expect(tester.germplasmResults).toBeNull();
    expect(tester.documents.length).toBe(0);
    expect(searchStateService.applyTransition).toHaveBeenCalledWith(toAllTransition);

    modelSubject.next({
      ...model,
      searchCriteria: {
        fragment: 'all'
      }
    } as Model);
    tester.detectChanges();

    expect(tester.documents.length).toBe(1);
  });

  it('should transition to all', () => {
    const criteria: SearchCriteria = {
      fragment: 'germplasm',
      page: 2,
      aggregationCriteria: [
        { name: 'entry', values: ['Germplasm'] },
        { name: 'species', values: ['SP1'] }
      ],
      descendants: true,
      sortCriterion: { sort: 'foo', direction: 'asc' },
      query: 'test'
    };
    const newCriteria = toAllTransition(criteria);
    expect(newCriteria).toEqual({
      fragment: null,
      page: 1,
      aggregationCriteria: [
        { name: 'entry', values: ['Germplasm'] },
        { name: 'species', values: ['SP1'] }
      ],
      descendants: true,
      sortCriterion: null,
      query: 'test'
    });
  });

  it('should transition to Germplasm', () => {
    const criteria: SearchCriteria = {
      fragment: null,
      page: 2,
      aggregationCriteria: [],
      descendants: true,
      sortCriterion: null,
      query: 'test'
    };
    const newCriteria = toGermplasmTransition(criteria);
    expect(newCriteria).toEqual({
      fragment: 'germplasm',
      page: 1,
      aggregationCriteria: [{ name: 'entry', values: ['Germplasm'] }],
      descendants: true,
      sortCriterion: null,
      query: 'test'
    });
  });

  it('should transition to Germplasm when entry aggregation already there', () => {
    const criteria: SearchCriteria = {
      fragment: null,
      page: 2,
      aggregationCriteria: [
        { name: 'entry', values: ['Germplasm', 'other'] },
        { name: 'species', values: ['SP1'] }
      ],
      descendants: true,
      sortCriterion: null,
      query: 'test'
    };
    const newCriteria = toGermplasmTransition(criteria);
    expect(newCriteria).toEqual({
      fragment: 'germplasm',
      page: 1,
      aggregationCriteria: [
        { name: 'species', values: ['SP1'] },
        { name: 'entry', values: ['Germplasm'] }
      ],
      descendants: true,
      sortCriterion: null,
      query: 'test'
    });
  });
});
