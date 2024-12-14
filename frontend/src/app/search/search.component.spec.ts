import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { filter, map, Observable, ReplaySubject } from 'rxjs';
import { ComponentTester, createMock, stubRoute } from 'ngx-speculoos';

import { SearchComponent } from './search.component';
import {
  toAggregation,
  toRareDocument,
  toSecondPage,
  toSinglePage
} from '../models/test-model-generators';
import { AggregationsComponent } from '../aggregations/aggregations.component';
import { SmallAggregationComponent } from '../small-aggregation/small-aggregation.component';
import { BasketService } from '../urgi-common/basket/basket.service';
import { Model, SearchStateService } from '../search-state.service';
import { DocumentModel } from '../models/document.model';
import { Page } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { provideI18nTesting } from '../i18n/mock-18n.spec';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';

class SearchComponentTester extends ComponentTester<SearchComponent> {
  constructor() {
    super(SearchComponent);
  }

  get searchBar() {
    return this.input('input')!;
  }

  get searchButton() {
    return this.button('button')!;
  }

  get loaders() {
    return this.elements('.loading');
  }

  get results() {
    return this.elements(GenericDocumentComponent);
  }

  get pagination() {
    return this.component(NgbPagination);
  }

  get aggregations() {
    return this.elements(SmallAggregationComponent);
  }

  get aggregationsComponent() {
    return this.component(AggregationsComponent);
  }

  get filterToggler() {
    return this.button('.filter-toggler');
  }
}

describe('SearchComponent', () => {
  let basketService: jasmine.SpyObj<BasketService>;
  let searchStateService: jasmine.SpyObj<SearchStateService>;
  let modelSubject: ReplaySubject<Model>;
  let route: ActivatedRoute;

  beforeEach(() => {
    basketService = createMock(BasketService);
    basketService.isEnabled.and.returnValue(true);
    basketService.isAccessionInBasket.and.returnValue(false);

    modelSubject = new ReplaySubject<Model>();
    searchStateService = createMock(SearchStateService);
    searchStateService.initialize.and.returnValue(modelSubject);
    searchStateService.getDocuments.and.returnValue(
      modelSubject.pipe(
        map(model => model.documents),
        filter(d => !!d)
      ) as Observable<Page<DocumentModel>>
    );

    route = stubRoute();

    TestBed.overrideComponent(SearchComponent, {
      set: { providers: [{ provide: SearchStateService, useValue: searchStateService }] }
    });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
        { provide: BasketService, useValue: basketService },
        { provide: ActivatedRoute, useValue: route }
      ]
    });
  });

  it('should initialize state service when created', () => {
    const tester = new SearchComponentTester();
    tester.detectChanges();
    expect(searchStateService.initialize).toHaveBeenCalledWith(route);

    const model: Model = {
      searchCriteria: {
        query: 'Bacteria',
        aggregationCriteria: [{ name: 'domain', values: ['Plant'] }],
        page: 2,
        descendants: false,
        fragment: null,
        sortCriterion: null
      },
      documents: toSecondPage([toRareDocument('Bacteria'), toRareDocument('Bacteria 2')]),
      documentsLoading: false,
      aggregations: [toAggregation('domain', ['Plant']), toAggregation('coo', ['France'])],
      aggregationsLoading: false,
      disabledAggregationName: null
    };

    modelSubject.next({
      ...model,
      aggregationsLoading: true,
      aggregations: [],
      documentsLoading: true,
      documents: null
    });
    tester.detectChanges();

    expect(tester.results.length).toBe(0);
    expect(tester.aggregations.length).toBe(0);
    expect(tester.loaders.length).toBe(2);
    expect(tester.pagination).toBeFalsy();

    modelSubject.next({
      ...model,
      documentsLoading: true,
      documents: null
    });
    tester.detectChanges();
    expect(tester.results.length).toBe(0);
    expect(tester.aggregations.length).toBe(2);
    expect(tester.loaders.length).toBe(1);
    expect(tester.pagination).toBeFalsy();

    modelSubject.next(model);
    tester.detectChanges();

    // then the search should be populated
    expect(tester.searchBar).toHaveValue('Bacteria');
    // and the results fetched
    expect(tester.results.length).toBe(2);
    expect(tester.aggregations.length).toBe(2);
    expect(tester.loaders.length).toBe(0);
    expect(tester.pagination).toBeTruthy();
  });

  describe('after initialization', () => {
    let tester: SearchComponentTester;
    let initialModel: Model;

    beforeEach(() => {
      tester = new SearchComponentTester();
      tester.detectChanges();

      expect(searchStateService.initialize).toHaveBeenCalledWith(route);

      initialModel = {
        searchCriteria: {
          query: 'Bacteria',
          aggregationCriteria: [{ name: 'domain', values: ['Plant'] }],
          page: 2,
          descendants: false,
          fragment: null,
          sortCriterion: null
        },
        documents: toSecondPage([toRareDocument('Bacteria'), toRareDocument('Bacteria 2')]),
        documentsLoading: false,
        aggregations: [toAggregation('domain', ['Plant']), toAggregation('coo', ['France'])],
        aggregationsLoading: false,
        disabledAggregationName: null
      };

      modelSubject.next(initialModel);
      tester.detectChanges();
    });

    it('should change aggregation', () => {
      const event: Array<AggregationCriterion> = [];
      tester.aggregationsComponent.aggregationsChange.emit(event);
      tester.detectChanges();

      expect(searchStateService.changeAggregations).toHaveBeenCalledWith(event);
    });

    it('should change page', fakeAsync(() => {
      tester.pagination.pageChange.emit(1);
      tester.detectChanges();
      tick();
      tester.detectChanges();

      expect(searchStateService.changePage).toHaveBeenCalledWith(1);
    }));

    it('should change search descendants', () => {
      const event = true;
      tester.aggregationsComponent.searchDescendants.set(event);
      tester.detectChanges();

      expect(searchStateService.changeSearchDescendants).toHaveBeenCalledWith(event);
    });

    it('should trigger new search', () => {
      tester.searchBar.fillWith('hello');
      tester.searchButton.click();

      expect(searchStateService.newSearch).toHaveBeenCalledWith('hello');
    });

    it('should toggle filters', () => {
      expect(tester.element('.fa-caret-up')).toBeNull();
      expect(tester.element('.fa-caret-down')).not.toBeNull();

      tester.filterToggler.click();

      expect(tester.element('.fa-caret-up')).not.toBeNull();
      expect(tester.element('.fa-caret-down')).toBeNull();

      tester.filterToggler.click();

      expect(tester.element('.fa-caret-up')).toBeNull();
      expect(tester.element('.fa-caret-down')).not.toBeNull();
    });

    it('should limit pagination to 500 pages, even if more results', () => {
      const content: Array<DocumentModel> = [];
      for (let i = 0; i < 20; i++) {
        content.push(toRareDocument(`Bacteria ${i}`));
      }

      const documents = {
        ...toSinglePage(content),
        totalElements: 12000,
        totalPages: 500,
        number: 200
      };
      modelSubject.next({
        ...initialModel,
        documents
      });
      tester.detectChanges();

      // then it should limit the pagination to 500 pages in the pagination
      // and a pagination with one page
      expect(tester.pagination).not.toBeNull();
      expect(tester.pagination.page).toBe(201);
      expect(tester.pagination.pageCount).toBe(500);
    });

    it('should not display pagination if empty result', () => {
      modelSubject.next({
        ...initialModel,
        documents: toSinglePage([])
      });
      tester.detectChanges();
      expect(tester.pagination).toBeNull();
    });

    it('should not display pagination if only one page of results', () => {
      modelSubject.next({
        ...initialModel,
        documents: toSinglePage([toRareDocument('Bacteria')])
      });
      tester.detectChanges();

      expect(tester.pagination).toBeNull();
    });

    it('should update criteria when they change', () => {
      modelSubject.next({
        ...initialModel,
        aggregations: [toAggregation('coo', ['France', 'Italy'])]
      });
      tester.detectChanges();

      expect(tester.aggregations.length).toBe(1);
    });
  });
});
