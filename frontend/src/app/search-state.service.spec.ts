import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Model, SearchStateService } from './search-state.service';
import { SearchService } from './search.service';
import { Params, Router } from '@angular/router';
import { ActivatedRouteStub, createMock, stubRoute } from 'ngx-speculoos';
import { toAggregation, toRareDocument, toSecondPage } from './models/test-model-generators';
import { of, Subject } from 'rxjs';
import { DocumentModel } from './models/document.model';
import { Aggregation, Page } from './models/page';

describe('SearchStateService', () => {
  let service!: SearchStateService;
  let searchService!: jasmine.SpyObj<SearchService>;
  let router!: jasmine.SpyObj<Router>;

  beforeEach(() => {
    searchService = createMock(SearchService);
    router = createMock(Router);

    TestBed.configureTestingModule({
      providers: [
        { provide: SearchService, useValue: searchService },
        { provide: Router, useValue: router },
        SearchStateService
      ]
    });

    service = TestBed.inject(SearchStateService);
  });

  it('should initialize state with query parameters and fragment', () => {
    const route = stubRoute({
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

    const model$ = service.initialize(route);

    const documents = toSecondPage([toRareDocument('Test')]);
    searchService.search.and.returnValue(of(documents));
    const aggregations = [toAggregation('entry', ['Germplasm'])];
    searchService.aggregate.and.returnValue(of(aggregations));

    let model: Model;
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

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should initialize state without loading status if it does not take too much time', fakeAsync(() => {
    const route = stubRoute({
      queryParams: {
        query: 'Test'
      }
    });

    const model$ = service.initialize(route);

    const documents = toSecondPage([toRareDocument('Test')]);
    const aggregations = [toAggregation('entry', ['Germplasm'])];

    const documentsSubject = new Subject<Page<DocumentModel>>();
    const aggregationsSubject = new Subject<Array<Aggregation>>();

    searchService.search.and.returnValue(documentsSubject);
    searchService.aggregate.and.returnValue(aggregationsSubject);

    let model: Model;
    model$.subscribe(m => (model = m));
    expect(model!).toBeFalsy();

    tick(100);
    documentsSubject.next(documents);
    expect(model!).toBeFalsy();

    tick(100);
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
  }));

  it('should initialize state with loading status if it does takes too much time', fakeAsync(() => {
    const route = stubRoute({
      queryParams: {
        query: 'Test'
      }
    });

    const model$ = service.initialize(route);

    const documents = toSecondPage([toRareDocument('Test')]);
    const aggregations = [toAggregation('entry', ['Germplasm'])];

    const documentsSubject = new Subject<Page<DocumentModel>>();
    const aggregationsSubject = new Subject<Array<Aggregation>>();

    searchService.search.and.returnValue(documentsSubject);
    searchService.aggregate.and.returnValue(aggregationsSubject);

    let model: Model;
    model$.subscribe(m => (model = m));
    expect(model!).toBeFalsy();

    tick(600);
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
  }));

  describe('once initialized', () => {
    let model: Model;
    let route: ActivatedRouteStub;

    let initialDocuments: Page<DocumentModel>;
    let initialAggregations: Array<Aggregation>;

    beforeEach(() => {
      route = stubRoute({
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

      const model$ = service.initialize(route);

      initialDocuments = toSecondPage([toRareDocument('Test')]);
      initialAggregations = [toAggregation('entry', ['Germplasm'])];

      searchService.search.and.returnValue(of(initialDocuments));
      searchService.aggregate.and.returnValue(of(initialAggregations));

      model$.subscribe(m => (model = m));

      searchService.search.calls.reset();
      searchService.aggregate.calls.reset();
      router.navigate.calls.reset();
    });

    it('should start a new search and navigate', () => {
      const documents = toSecondPage([toRareDocument('Test2')]);
      const aggregations = [toAggregation('entry', ['Germplasm2'])];

      const documentsSubject = new Subject<Page<DocumentModel>>();
      const aggregationsSubject = new Subject<Array<Aggregation>>();
      searchService.search.and.returnValue(documentsSubject);
      searchService.aggregate.and.returnValue(aggregationsSubject);

      service.newSearch('Test2');
      const expectedQueryParams: Params = {
        query: 'Test2',
        page: 1,
        descendants: false
      };
      expect(router.navigate).toHaveBeenCalledWith(['.'], {
        relativeTo: route,
        queryParams: expectedQueryParams,
        fragment: undefined
      });

      route.triggerNavigation({
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

    it('should change aggregations and navigate', () => {
      const documents = toSecondPage([toRareDocument('Test2')]);
      const aggregations = [toAggregation('entry', ['Germplasm2'])];

      const documentsSubject = new Subject<Page<DocumentModel>>();
      const aggregationsSubject = new Subject<Array<Aggregation>>();
      searchService.search.and.returnValue(documentsSubject);
      searchService.aggregate.and.returnValue(aggregationsSubject);

      service.changeAggregations([{ name: 'coo', values: ['BE'] }]);
      const expectedQueryParams: Params = {
        query: 'Test',
        page: 1,
        descendants: true,
        coo: ['BE'],
        sort: 'name',
        direction: 'desc'
      };
      expect(router.navigate).toHaveBeenCalledWith(['.'], {
        relativeTo: route,
        queryParams: expectedQueryParams,
        fragment: 'germplasm'
      });

      route.setQueryParams(expectedQueryParams);

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

    it('should change search descendants and navigate', () => {
      const documents = toSecondPage([toRareDocument('Test2')]);
      const aggregations = [toAggregation('entry', ['Germplasm2'])];

      const documentsSubject = new Subject<Page<DocumentModel>>();
      const aggregationsSubject = new Subject<Array<Aggregation>>();
      searchService.search.and.returnValue(documentsSubject);
      searchService.aggregate.and.returnValue(aggregationsSubject);

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
      expect(router.navigate).toHaveBeenCalledWith(['.'], {
        relativeTo: route,
        queryParams: expectedQueryParams,
        fragment: 'germplasm'
      });

      route.setQueryParams(expectedQueryParams);

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

    it('should sort and navigate, and not aggregate again', () => {
      const documents = toSecondPage([toRareDocument('Test2')]);

      const documentsSubject = new Subject<Page<DocumentModel>>();
      searchService.search.and.returnValue(documentsSubject);

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
      expect(router.navigate).toHaveBeenCalledWith(['.'], {
        relativeTo: route,
        queryParams: expectedQueryParams,
        fragment: 'germplasm'
      });

      route.setQueryParams(expectedQueryParams);

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

    it('should disable aggregation', () => {
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

    it('should update model when query params and fragment change', () => {
      const documents = toSecondPage([toRareDocument('Test2')]);
      const aggregations = [toAggregation('entry', ['Germplasm2'])];

      const documentsSubject = new Subject<Page<DocumentModel>>();
      const aggregationsSubject = new Subject<Array<Aggregation>>();
      searchService.search.and.returnValue(documentsSubject);
      searchService.aggregate.and.returnValue(aggregationsSubject);

      route.triggerNavigation({
        queryParams: { query: 'foo' },
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
