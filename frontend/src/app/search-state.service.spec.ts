import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Model, SearchStateService } from './search-state.service';
import { SearchService } from './search.service';
import { ActivatedRoute, Params, provideRouter, Router } from '@angular/router';
import { createMock, MockObject } from '../test/mock';
import { toAggregation, toRareDocument, toSecondPage } from './models/test-model-generators';
import { of, Subject } from 'rxjs';
import { DocumentModel } from './models/document.model';
import { Aggregation, Page } from './models/page';

describe('SearchStateService', () => {
  let service!: SearchStateService;
  let searchService!: MockObject<SearchService>;
  let router!: Router;

  beforeEach(() => {
    searchService = createMock(SearchService);

    TestBed.configureTestingModule({
      providers: [
        { provide: SearchService, useValue: searchService },
        provideRouter([]),
        SearchStateService
      ]
    });

    router = TestBed.inject(Router);
    service = TestBed.inject(SearchStateService);
  });

  afterEach(() => vi.useRealTimers());

  test('should initialize state with query parameters and fragment', async () => {
    await router.navigate([], {
      queryParams: {
        query: 'Test',
        page: '2',
        entry: 'Germplasm',
        coo: ['FR', 'IT'],
        sort: 'name',
        direction: 'desc',
        descendants: 'true'
      },
      fragment: 'germplasm'
    });
    const navigateSpy = vi.spyOn(router, 'navigate');
    const documents = toSecondPage([toRareDocument('Test')]);
    searchService.search.mockReturnValue(of(documents));
    const aggregations = [toAggregation('entry', ['Germplasm'])];
    searchService.aggregate.mockReturnValue(of(aggregations));

    const route = TestBed.inject(ActivatedRoute);
    const model$ = service.initialize(route);

    let model: Model | undefined;
    model$.subscribe(m => (model = m));

    expect(model!).toEqual({
      searchCriteria: {
        query: 'Test',
        page: 2,
        descendants: true,
        aggregationCriteria: [
          {
            name: 'entry',
            values: ['Germplasm']
          },
          {
            name: 'coo',
            values: ['FR', 'IT']
          }
        ],
        sortCriterion: {
          sort: 'name',
          direction: 'desc'
        },
        fragment: 'germplasm'
      },
      documents,
      aggregations,
      disabledAggregationName: null,
      documentsLoading: false,
      aggregationsLoading: false
    });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  test('should initialize state without loading status if it does not take too much time', async () => {
    vi.useFakeTimers();
    await router.navigate([], {
      queryParams: {
        query: 'Test'
      }
    });

    const documents = toSecondPage([toRareDocument('Test')]);
    const aggregations = [toAggregation('entry', ['Germplasm'])];

    const documentsSubject = new Subject<Page<DocumentModel>>();
    const aggregationsSubject = new Subject<Array<Aggregation>>();

    searchService.search.mockReturnValue(documentsSubject);
    searchService.aggregate.mockReturnValue(aggregationsSubject);

    const route = TestBed.inject(ActivatedRoute);
    const model$ = service.initialize(route);

    let model: Model | undefined;
    model$.subscribe(m => (model = m));
    expect(model).toBeFalsy();

    vi.advanceTimersByTime(100);
    documentsSubject.next(documents);
    documentsSubject.complete();
    expect(model!).toBeFalsy();

    vi.advanceTimersByTime(100);
    aggregationsSubject.next(aggregations);
    aggregationsSubject.complete();
    expect(model!).toEqual({
      searchCriteria: {
        query: 'Test',
        page: 1,
        descendants: false,
        aggregationCriteria: [],
        sortCriterion: null,
        fragment: null
      },
      documents,
      aggregations,
      disabledAggregationName: null,
      documentsLoading: false,
      aggregationsLoading: false
    });
  });

  test('should initialize state with loading status if it does takes too much time', async () => {
    vi.useFakeTimers();
    await router.navigate([], {
      queryParams: {
        query: 'Test'
      }
    });

    const documents = toSecondPage([toRareDocument('Test')]);
    const aggregations = [toAggregation('entry', ['Germplasm'])];

    const documentsSubject = new Subject<Page<DocumentModel>>();
    const aggregationsSubject = new Subject<Array<Aggregation>>();

    searchService.search.mockReturnValue(documentsSubject);
    searchService.aggregate.mockReturnValue(aggregationsSubject);

    const route = TestBed.inject(ActivatedRoute);
    const model$ = service.initialize(route);

    let model: Model | undefined;
    model$.subscribe(m => (model = m));
    expect(model).toBeFalsy();

    vi.advanceTimersByTime(600);
    expect(model!).toEqual({
      searchCriteria: {
        query: 'Test',
        page: 1,
        descendants: false,
        aggregationCriteria: [],
        sortCriterion: null,
        fragment: null
      },
      documents: null,
      aggregations: [],
      disabledAggregationName: null,
      documentsLoading: true,
      aggregationsLoading: true
    });

    documentsSubject.next(documents);
    expect(model!).toEqual({
      searchCriteria: {
        query: 'Test',
        page: 1,
        descendants: false,
        aggregationCriteria: [],
        sortCriterion: null,
        fragment: null
      },
      documents,
      aggregations: [],
      disabledAggregationName: null,
      documentsLoading: false,
      aggregationsLoading: true
    });

    aggregationsSubject.next(aggregations);
    expect(model!).toEqual({
      searchCriteria: {
        query: 'Test',
        page: 1,
        descendants: false,
        aggregationCriteria: [],
        sortCriterion: null,
        fragment: null
      },
      documents,
      aggregations,
      disabledAggregationName: null,
      documentsLoading: false,
      aggregationsLoading: false
    });
  });

  test('should set loading to false if an error occurs', async () => {
    vi.useFakeTimers();
    await router.navigate([], {
      queryParams: {
        query: 'Test'
      }
    });

    const documentsSubject = new Subject<Page<DocumentModel>>();
    const aggregationsSubject = new Subject<Array<Aggregation>>();

    searchService.search.mockReturnValue(documentsSubject);
    searchService.aggregate.mockReturnValue(aggregationsSubject);

    const route = TestBed.inject(ActivatedRoute);
    const model$ = service.initialize(route);

    let model: Model | undefined;
    model$.subscribe(m => (model = m));
    expect(model).toBeFalsy();

    vi.advanceTimersByTime(600);
    expect(model!).toEqual({
      searchCriteria: {
        query: 'Test',
        page: 1,
        descendants: false,
        aggregationCriteria: [],
        sortCriterion: null,
        fragment: null
      },
      documents: null,
      aggregations: [],
      disabledAggregationName: null,
      documentsLoading: true,
      aggregationsLoading: true
    });

    documentsSubject.error('oops');
    expect(model!).toEqual({
      searchCriteria: {
        query: 'Test',
        page: 1,
        descendants: false,
        aggregationCriteria: [],
        sortCriterion: null,
        fragment: null
      },
      documents: null,
      aggregations: [],
      disabledAggregationName: null,
      documentsLoading: false,
      aggregationsLoading: true
    });

    aggregationsSubject.error('oops');
    expect(model!).toEqual({
      searchCriteria: {
        query: 'Test',
        page: 1,
        descendants: false,
        aggregationCriteria: [],
        sortCriterion: null,
        fragment: null
      },
      documents: null,
      aggregations: [],
      disabledAggregationName: null,
      documentsLoading: false,
      aggregationsLoading: false
    });
  });

  describe('once initialized', () => {
    let model: Model;
    let route: ActivatedRoute;

    let initialDocuments: Page<DocumentModel>;
    let initialAggregations: Array<Aggregation>;

    beforeEach(async () => {
      await router.navigate([], {
        queryParams: {
          query: 'Test',
          page: '2',
          entry: 'Germplasm',
          coo: ['FR', 'IT'],
          sort: 'name',
          direction: 'desc',
          descendants: 'true'
        },
        fragment: 'germplasm'
      });
      route = TestBed.inject(ActivatedRoute);

      initialDocuments = toSecondPage([toRareDocument('Test')]);
      initialAggregations = [toAggregation('entry', ['Germplasm'])];

      searchService.search.mockReturnValue(of(initialDocuments));
      searchService.aggregate.mockReturnValue(of(initialAggregations));

      const model$ = service.initialize(route);

      model$.subscribe(m => (model = m));

      // Wait for initial model to be set
      await new Promise(resolve => setTimeout(resolve, 10));

      searchService.search.mockReset();
      searchService.aggregate.mockReset();
    });

    test('should start a new search and navigate', async () => {
      const documents = toSecondPage([toRareDocument('Test2')]);
      const aggregations = [toAggregation('entry', ['Germplasm2'])];

      const documentsSubject = new Subject<Page<DocumentModel>>();
      const aggregationsSubject = new Subject<Array<Aggregation>>();
      searchService.search.mockReturnValue(documentsSubject);
      searchService.aggregate.mockReturnValue(aggregationsSubject);
      const navigateSpy = vi.spyOn(router, 'navigate');

      service.newSearch('Test2');
      const expectedQueryParams: Params = {
        query: 'Test2',
        page: 1,
        descendants: false
      };
      expect(navigateSpy).toHaveBeenCalledWith(['.'], {
        relativeTo: route,
        queryParams: expectedQueryParams,
        fragment: undefined
      });

      await router.navigate([], {
        queryParams: expectedQueryParams,
        fragment: null
      });
      expect(searchService.search).toHaveBeenCalled();
      expect(searchService.aggregate).toHaveBeenCalled();

      documentsSubject.next(documents);
      aggregationsSubject.next(aggregations);

      expect(model!).toEqual({
        searchCriteria: {
          query: 'Test2',
          page: 1,
          descendants: false,
          aggregationCriteria: [],
          sortCriterion: null,
          fragment: null
        },
        documents,
        aggregations,
        disabledAggregationName: null,
        documentsLoading: false,
        aggregationsLoading: false
      });
    });

    test('should change aggregations and navigate', async () => {
      const documents = toSecondPage([toRareDocument('Test2')]);
      const aggregations = [toAggregation('entry', ['Germplasm2'])];

      const documentsSubject = new Subject<Page<DocumentModel>>();
      const aggregationsSubject = new Subject<Array<Aggregation>>();
      searchService.search.mockReturnValue(documentsSubject);
      searchService.aggregate.mockReturnValue(aggregationsSubject);

      const navigateSpy = vi.spyOn(router, 'navigate');

      service.changeAggregations([{ name: 'coo', values: ['BE'] }]);
      const expectedQueryParams: Params = {
        query: 'Test',
        page: 1,
        descendants: true,
        coo: ['BE'],
        sort: 'name',
        direction: 'desc'
      };
      expect(navigateSpy).toHaveBeenCalledWith(['.'], {
        relativeTo: route,
        queryParams: expectedQueryParams,
        fragment: 'germplasm'
      });

      await router.navigate([], {
        queryParams: expectedQueryParams,
        fragment: 'germplasm'
      });

      expect(searchService.search).toHaveBeenCalled();
      expect(searchService.aggregate).toHaveBeenCalled();

      documentsSubject.next(documents);
      aggregationsSubject.next(aggregations);

      expect(model!).toEqual({
        searchCriteria: {
          query: 'Test',
          page: 1,
          descendants: true,
          aggregationCriteria: [{ name: 'coo', values: ['BE'] }],
          sortCriterion: {
            sort: 'name',
            direction: 'desc'
          },
          fragment: 'germplasm'
        },
        documents,
        aggregations,
        disabledAggregationName: null,
        documentsLoading: false,
        aggregationsLoading: false
      });
    });

    test('should change search descendants and navigate', async () => {
      const documents = toSecondPage([toRareDocument('Test2')]);
      const aggregations = [toAggregation('entry', ['Germplasm2'])];

      const documentsSubject = new Subject<Page<DocumentModel>>();
      const aggregationsSubject = new Subject<Array<Aggregation>>();
      searchService.search.mockReturnValue(documentsSubject);
      searchService.aggregate.mockReturnValue(aggregationsSubject);

      const navigateSpy = vi.spyOn(router, 'navigate');

      service.changeSearchDescendants(false);
      const expectedQueryParams: Params = {
        query: 'Test',
        page: 1,
        entry: ['Germplasm'],
        coo: ['FR', 'IT'],
        sort: 'name',
        direction: 'desc',
        descendants: false
      };
      expect(navigateSpy).toHaveBeenCalledWith(['.'], {
        relativeTo: route,
        queryParams: expectedQueryParams,
        fragment: 'germplasm'
      });

      await router.navigate([], {
        queryParams: expectedQueryParams,
        fragment: 'germplasm'
      });

      expect(searchService.search).toHaveBeenCalled();
      expect(searchService.aggregate).toHaveBeenCalled();

      documentsSubject.next(documents);
      aggregationsSubject.next(aggregations);

      expect(model!).toEqual({
        searchCriteria: {
          query: 'Test',
          page: 1,
          descendants: false,
          aggregationCriteria: [
            { name: 'entry', values: ['Germplasm'] },
            { name: 'coo', values: ['FR', 'IT'] }
          ],
          sortCriterion: {
            sort: 'name',
            direction: 'desc'
          },
          fragment: 'germplasm'
        },
        documents,
        aggregations,
        disabledAggregationName: null,
        documentsLoading: false,
        aggregationsLoading: false
      });
    });

    test('should sort and navigate, and not aggregate again', async () => {
      const documents = toSecondPage([toRareDocument('Test2')]);

      const documentsSubject = new Subject<Page<DocumentModel>>();
      searchService.search.mockReturnValue(documentsSubject);

      const navigateSpy = vi.spyOn(router, 'navigate');

      service.sort({ sort: 'accession', direction: 'asc' });
      const expectedQueryParams: Params = {
        query: 'Test',
        page: 1,
        entry: ['Germplasm'],
        coo: ['FR', 'IT'],
        sort: 'accession',
        direction: 'asc',
        descendants: true
      };
      expect(navigateSpy).toHaveBeenCalledWith(['.'], {
        relativeTo: route,
        queryParams: expectedQueryParams,
        fragment: 'germplasm'
      });

      await router.navigate([], {
        queryParams: expectedQueryParams,
        fragment: 'germplasm'
      });

      expect(searchService.search).toHaveBeenCalled();
      expect(searchService.aggregate).not.toHaveBeenCalled();

      documentsSubject.next(documents);

      expect(model!).toEqual({
        searchCriteria: {
          query: 'Test',
          page: 1,
          descendants: true,
          aggregationCriteria: [
            { name: 'entry', values: ['Germplasm'] },
            { name: 'coo', values: ['FR', 'IT'] }
          ],
          sortCriterion: {
            sort: 'accession',
            direction: 'asc'
          },
          fragment: 'germplasm'
        },
        documents,
        aggregations: initialAggregations,
        disabledAggregationName: null,
        documentsLoading: false,
        aggregationsLoading: false
      });
    });

    test('should disable aggregation', () => {
      service.disableAggregation('entry');

      expect(model!).toEqual({
        searchCriteria: {
          query: 'Test',
          page: 2,
          descendants: true,
          aggregationCriteria: [
            { name: 'entry', values: ['Germplasm'] },
            { name: 'coo', values: ['FR', 'IT'] }
          ],
          sortCriterion: {
            sort: 'name',
            direction: 'desc'
          },
          fragment: 'germplasm'
        },
        documents: initialDocuments,
        aggregations: initialAggregations,
        disabledAggregationName: 'entry',
        documentsLoading: false,
        aggregationsLoading: false
      });
    });

    test('should update model when query params and fragment change', async () => {
      const documents = toSecondPage([toRareDocument('Test2')]);
      const aggregations = [toAggregation('entry', ['Germplasm2'])];

      const documentsSubject = new Subject<Page<DocumentModel>>();
      const aggregationsSubject = new Subject<Array<Aggregation>>();
      searchService.search.mockReturnValue(documentsSubject);
      searchService.aggregate.mockReturnValue(aggregationsSubject);

      await router.navigate([], {
        queryParams: {
          query: 'foo'
        },
        fragment: null
      });

      expect(searchService.search).toHaveBeenCalled();
      expect(searchService.aggregate).toHaveBeenCalled();

      documentsSubject.next(documents);
      aggregationsSubject.next(aggregations);

      expect(model!).toEqual({
        searchCriteria: {
          query: 'foo',
          page: 1,
          descendants: false,
          aggregationCriteria: [],
          sortCriterion: null,
          fragment: null
        },
        documents,
        aggregations,
        disabledAggregationName: null,
        documentsLoading: false,
        aggregationsLoading: false
      });
    });
  });
});
