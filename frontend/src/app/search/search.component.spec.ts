import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { filter, map, Observable, ReplaySubject } from 'rxjs';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';
import { createMock, MockObject } from '../../test/mock';
import { SearchComponent } from './search.component';
import {
  toAggregation,
  toRareDocument,
  toSecondPage,
  toSinglePage
} from '../models/test-model-generators';
import { AggregationsComponent } from '../aggregations/aggregations.component';
import { BasketService } from '../urgi-common/basket/basket.service';
import { Model, SearchStateService } from '../search-state.service';
import { DocumentModel } from '../models/document.model';
import { Page } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { provideI18nTesting } from '../i18n/mock-18n';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { SmallAggregationComponent } from '../small-aggregation/small-aggregation.component';

class SearchComponentTester {
  readonly fixture = TestBed.createComponent(SearchComponent);
  readonly searchBar = page.getByCss('#query');
  readonly searchButton = page.getByRole('button', { name: 'Search' });
  readonly loaders = page.getByCss('.loading');
  readonly filterToggler = page.getByCss('.filter-toggler');
  readonly caretUp = page.getByCss('.fa-caret-up');
  readonly caretDown = page.getByCss('.fa-caret-down');
  readonly results = page.getByCss('dd-document');
  get pagination() {
    return this.fixture.debugElement.query(By.directive(NgbPagination))
      ?.componentInstance as NgbPagination;
  }
  get aggregations() {
    return this.fixture.debugElement.queryAll(By.directive(SmallAggregationComponent));
  }
  get aggregationsComponent() {
    return this.fixture.debugElement.query(By.directive(AggregationsComponent))
      ?.componentInstance as AggregationsComponent;
  }
}

describe('SearchComponent', () => {
  let basketService: MockObject<BasketService>;
  let searchStateService: MockObject<SearchStateService>;
  let modelSubject: ReplaySubject<Model>;

  beforeEach(() => {
    basketService = createMock(BasketService);
    basketService.isEnabled.mockReturnValue(true);
    basketService.isItemInBasket.mockReturnValue(false);

    modelSubject = new ReplaySubject<Model>();
    searchStateService = createMock(SearchStateService);
    searchStateService.initialize.mockReturnValue(modelSubject);
    searchStateService.getDocuments.mockReturnValue(
      modelSubject.pipe(
        map(model => model.documents),
        filter(d => !!d)
      ) as Observable<Page<DocumentModel>>
    );

    TestBed.overrideComponent(SearchComponent, {
      set: { providers: [{ provide: SearchStateService, useValue: searchStateService }] }
    });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideI18nTesting(),
        provideRouter([]),
        { provide: BasketService, useValue: basketService }
      ]
    });
  });

  test('should initialize state service when created', async () => {
    const route = TestBed.inject(ActivatedRoute);
    const tester = new SearchComponentTester();
    await tester.fixture.whenStable();
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
    await tester.fixture.whenStable();

    await expect.element(tester.results).toHaveLength(0);
    expect(tester.aggregations).toHaveLength(0);
    await expect.element(tester.loaders).toHaveLength(2);
    expect(tester.pagination).toBeFalsy();

    modelSubject.next({
      ...model,
      documentsLoading: true,
      documents: null
    });
    await tester.fixture.whenStable();
    await expect.element(tester.results).toHaveLength(0);
    expect(tester.aggregations).toHaveLength(2);
    await expect.element(tester.loaders).toHaveLength(1);
    expect(tester.pagination).toBeFalsy();

    modelSubject.next(model);
    await tester.fixture.whenStable();

    // then the search should be populated
    await expect.element(tester.searchBar).toHaveValue('Bacteria');
    // and the results fetched
    await expect.element(tester.results).toHaveLength(2);
    expect(tester.aggregations).toHaveLength(2);
    await expect.element(tester.loaders).toHaveLength(0);
    expect(tester.pagination).toBeTruthy();
  });

  describe('after initialization', () => {
    let tester: SearchComponentTester;
    let initialModel: Model;

    beforeEach(async () => {
      const route = TestBed.inject(ActivatedRoute);
      tester = new SearchComponentTester();
      await tester.fixture.whenStable();

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
      await tester.fixture.whenStable();
    });

    test('should change aggregation', async () => {
      const event: Array<AggregationCriterion> = [];
      tester.aggregationsComponent!.aggregationsChange.emit(event);
      await tester.fixture.whenStable();

      expect(searchStateService.changeAggregations).toHaveBeenCalledWith(event);
    });

    test('should change page', async () => {
      tester.pagination!.pageChange.emit(1);
      await tester.fixture.whenStable();

      expect(searchStateService.changePage).toHaveBeenCalledWith(1);
    });

    test('should change search descendants', async () => {
      const event = true;
      tester.aggregationsComponent!.searchDescendants.set(event);
      await tester.fixture.whenStable();

      expect(searchStateService.changeSearchDescendants).toHaveBeenCalledWith(event);
    });

    test('should trigger new search', async () => {
      await tester.searchBar.fill('hello');
      await tester.searchButton.click();

      expect(searchStateService.newSearch).toHaveBeenCalledWith('hello');
    });

    test('should toggle filters', async () => {
      await expect.element(tester.caretUp).not.toBeInTheDocument();
      await expect.element(tester.caretDown).toBeInTheDocument();

      await tester.filterToggler.click();

      await expect.element(tester.caretUp).toBeInTheDocument();
      await expect.element(tester.caretDown).not.toBeInTheDocument();

      await tester.filterToggler.click();

      await expect.element(tester.caretUp).not.toBeInTheDocument();
      await expect.element(tester.caretDown).toBeInTheDocument();
    });

    test('should limit pagination to 500 pages, even if more results', async () => {
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
      await tester.fixture.whenStable();

      // then it should limit the pagination to 500 pages in the pagination
      // and a pagination with one page
      expect(tester.pagination).not.toBeNull();
      expect(tester.pagination!.page).toBe(201);
      expect(tester.pagination!.pageCount).toBe(500);
    });

    test('should not display pagination if empty result', async () => {
      modelSubject.next({
        ...initialModel,
        documents: toSinglePage([])
      });
      await tester.fixture.whenStable();
      expect(tester.pagination).toBeFalsy();
    });

    test('should not display pagination if only one page of results', async () => {
      modelSubject.next({
        ...initialModel,
        documents: toSinglePage([toRareDocument('Bacteria')])
      });
      await tester.fixture.whenStable();

      expect(tester.pagination).toBeFalsy();
    });

    test('should update criteria when they change', async () => {
      modelSubject.next({
        ...initialModel,
        aggregations: [toAggregation('coo', ['France', 'Italy'])]
      });
      await tester.fixture.whenStable();

      expect(tester.aggregations).toHaveLength(1);
    });
  });
});
