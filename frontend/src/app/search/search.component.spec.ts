import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgbPagination, NgbPaginationModule, NgbTooltipModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ComponentTester, fakeRoute, speculoosMatchers } from 'ngx-speculoos';

import { SearchComponent } from './search.component';
import { DocumentsComponent } from '../documents/documents.component';
import { RareDocumentComponent } from '../rare/rare-document/rare-document.component';
import { SearchService } from '../search.service';
import { DocumentModel } from '../models/document.model';
import { toAggregation, toRareDocument, toSecondPage, toSinglePage } from '../models/test-model-generators';
import { AggregationsComponent } from '../aggregations/aggregations.component';
import { SmallAggregationComponent } from '../small-aggregation/small-aggregation.component';
import { LargeAggregationComponent } from '../large-aggregation/large-aggregation.component';
import { AggregationNamePipe } from '../aggregation-name.pipe';
import { DocumentCountComponent } from '../document-count/document-count.component';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

class SearchComponentTester extends ComponentTester<SearchComponent> {
  constructor() {
    super(SearchComponent);
  }

  get searchBar() {
    return this.input('input');
  }

  get searchButton() {
    return this.button('button');
  }

  get results() {
    return this.debugElement.query(By.directive(DocumentsComponent));
  }

  get pagination() {
    return this.debugElement.query(By.directive(NgbPagination));
  }

  get aggregations() {
    return this.debugElement.query(By.directive(AggregationsComponent));
  }
}

describe('SearchComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,
      RouterTestingModule,
      HttpClientTestingModule,
      NgbPaginationModule,
      NgbTypeaheadModule,
      NgbTooltipModule,
      NoopAnimationsModule
    ],
    declarations: [
      SearchComponent,
      DocumentsComponent,
      RareDocumentComponent,
      AggregationsComponent,
      SmallAggregationComponent,
      LargeAggregationComponent,
      AggregationNamePipe,
      DocumentCountComponent,
      LoadingSpinnerComponent,
      TruncatableDescriptionComponent
    ]
  }));

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should search on init if there is a query', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const searchService = TestBed.get(SearchService) as SearchService;
    const results = toSinglePage([], [toAggregation('domain', ['Plant'])]);
    spyOn(searchService, 'search').and.returnValue(of(results));

    // with a query on init
    const query = 'Bacteria';
    const queryParams = of({ query });
    const activatedRoute = fakeRoute({ queryParams });
    const component = new SearchComponent(activatedRoute, router, searchService);

    // when loading
    component.ngOnInit();

    // then the search should be populated
    expect(component.searchForm.get('search').value).toBe(query);
    // the search service called with page 1, no criteria and asked for aggregations
    expect(searchService.search).toHaveBeenCalledWith(query, [], 1);
    // and the results fetched
    expect(component.results).toEqual(results);
    expect(component.aggregations).toEqual(results.aggregations);
  });

  it('should search on init if there is a query and a page', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const searchService = TestBed.get(SearchService) as SearchService;
    const results = toSinglePage([]);
    spyOn(searchService, 'search').and.returnValue(of(results));

    // with a query on init
    const query = 'Bacteria';
    const page = 3;
    const queryParams = of({ query, page });
    const activatedRoute = fakeRoute({ queryParams });
    const component = new SearchComponent(activatedRoute, router, searchService);
    // but this query was already the same
    component.query = query;

    // when loading
    component.ngOnInit();

    // then the search should be populated
    expect(component.searchForm.get('search').value).toBe(query);
    // the search service called with page 3, no criteria and and asked for aggregations
    expect(searchService.search).toHaveBeenCalledWith(query, [], 3);
    // and the results fetched
    expect(component.results).toEqual(results);
    expect(component.aggregations).toEqual([]);
  });

  it('should search on init if there is a query, a page and criteria', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const searchService = TestBed.get(SearchService) as SearchService;
    const results = toSinglePage([]);
    spyOn(searchService, 'search').and.returnValue(of(results));

    // with a query on init
    const query = 'Bacteria';
    const page = 3;
    // and criteria
    const domain = 'Plant';
    const coo = ['France', 'Italy'];
    const queryParams = of({ query, page, domain, coo });
    const activatedRoute = fakeRoute({ queryParams });
    const component = new SearchComponent(activatedRoute, router, searchService);
    // but this query was already the same
    component.query = query;

    // when loading
    component.ngOnInit();

    // then the search should be populated
    expect(component.searchForm.get('search').value).toBe(query);
    // the search service called with page 1, the criteria and asked for aggregations
    const cooCriteria = { name: 'coo', values: ['France', 'Italy'] };
    const domainCriteria = { name: 'domain', values: ['Plant'] };
    expect(searchService.search).toHaveBeenCalledWith(query, [domainCriteria, cooCriteria], 3);
    // and the results fetched
    expect(component.results).toEqual(results);
    expect(component.aggregations).toEqual([]);
  });


  it('should search on init if there is a query, a page and criteria and display aggregations', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const searchService = TestBed.get(SearchService) as SearchService;
    const resource = toRareDocument('Bacteria');
    const aggregation = toAggregation('coo', ['France', 'Italy']);
    const expectedResults = toSinglePage([resource]);
    // const expectedAggregations = toSinglePage([resource], [aggregation]);

    spyOn(searchService, 'search').and.returnValue(of(expectedResults));

    // with a query on init
    const query = 'Bacteria';
    const page = 3;
    // and criteria
    const domain = 'Plant';
    const coo = ['France', 'Italy'];
    const queryParams = of({ query, page, domain, coo });
    const activatedRoute = fakeRoute({ queryParams });
    const component = new SearchComponent(activatedRoute, router, searchService);
    // but this query was already the same
    component.query = query;

    // when loading
    component.ngOnInit();

    // then the search should be populated
    expect(component.searchForm.get('search').value).toBe(query);
    // the search service called with page 1, the criteria and asked for aggregations
    const cooCriteria = { name: 'coo', values: ['France', 'Italy'] };
    const domainCriteria = { name: 'domain', values: ['Plant'] };
    expect(searchService.search).toHaveBeenCalledWith(query, [domainCriteria, cooCriteria], 3);
    // and the results fetched
    expect(component.results).toEqual(expectedResults);
    expect(component.aggregations).toEqual([aggregation]);
  });

  it('should hide results and pagination on a new search', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const searchService = TestBed.get(SearchService) as SearchService;
    const results = toSinglePage([]);

    // with a query on init
    const query = 'Bacteria';
    const page = 3;
    // and criteria
    const domain = 'Plant';
    const coo = ['France', 'Italy'];
    const queryParams = of({ query, page, domain, coo });
    const activatedRoute = fakeRoute({ queryParams });
    const component = new SearchComponent(activatedRoute, router, searchService);
    // with an existing query and results
    component.query = 'Rosa';
    component.results = results;

    // when loading
    component.ngOnInit();

    // and the results emptied
    expect(component.results).toBeUndefined();
    expect(component.aggregations).toEqual([]);
  });

  it('should navigate to search and reset the page to default when a query is entered', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const searchService = TestBed.get(SearchService) as SearchService;
    spyOn(searchService, 'search');
    // with a current query Rosa and a current page 2
    let query = 'Rosa';
    // and criteria
    const domain = 'Plant';
    const coo = ['France', 'Italy'];
    const queryParams = of({ query, page: 2, domain, coo });
    const activatedRoute = fakeRoute({ queryParams });
    const component = new SearchComponent(activatedRoute, router, searchService);

    query = 'Bacteria';
    component.searchForm.get('search').setValue(query);
    // when searching with a new query Bacteria
    component.newSearch();

    // then it should redirect to the search with the new query, no page and no criteria
    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: activatedRoute,
      queryParams: {
        query,
        page: undefined
      }
    });
  });

  it('should navigate to requested page and keep criteria when pagination is used', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const searchService = TestBed.get(SearchService) as SearchService;
    spyOn(searchService, 'search');
    const query = 'Bacteria';
    // and criteria
    const domain = ['Plant'];
    const coo = ['France', 'Italy'];
    const queryParams = of({ query, domain, coo });
    const activatedRoute = fakeRoute({ queryParams });
    const component = new SearchComponent(activatedRoute, router, searchService);
    component.query = query;
    component.aggregationCriteria = [
      { name: 'coo', values: ['France', 'Italy'] },
      { name: 'domain', values: ['Plant'] }
    ];

    // when navigating
    component.navigateToPage(2);

    // then it should redirect to the search with correct parameters
    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: activatedRoute,
      queryParams: {
        query,
        page: '2',
        coo,
        domain
      }
    });
  });

  it('should toggle filters', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    const searchService = TestBed.get(SearchService) as SearchService;
    const activatedRoute = fakeRoute({});
    const component = new SearchComponent(activatedRoute, router, searchService);
    expect(component.filters).toBe('hide');

    // when toggling filters
    component.toggleFilters();

    // then it should show the filters
    expect(component.filters).toBe('show');

    // when toggling filters again
    component.toggleFilters();

    // then it should hide the filters
    expect(component.filters).toBe('hide');
  });

  it('should display a search bar and trigger a search', () => {
    // given a component
    const tester = new SearchComponentTester();
    const component = tester.componentInstance;
    spyOn(component, 'newSearch');

    // then it should display the search bar containing that query
    tester.detectChanges();

    expect(tester.searchBar).toHaveValue('');

    // with a query
    const query = 'Bacteria';
    tester.searchBar.fillWith(query);

    // trigger search
    tester.searchButton.click();
    expect(component.newSearch).toHaveBeenCalled();
    expect(component.searchForm.get('search').value).toBe(query);
  });

  it('should display results and pagination', () => {
    // given a component
    const tester = new SearchComponentTester();
    const component = tester.componentInstance;
    tester.detectChanges();

    // then it should not display results if empty
    expect(tester.results).toBeNull();

    // when it has results
    const resource = toRareDocument('Bacteria');
    component.results = toSecondPage([resource]);
    tester.detectChanges();

    // then it should display them
    expect(tester.results).not.toBeNull();
    const componentInstance = tester.results.componentInstance as DocumentsComponent;
    expect(componentInstance.documents).toEqual(component.results);

    // and a pagination with one page
    expect(tester.pagination).not.toBeNull();
    const paginationComponent = tester.pagination.componentInstance as NgbPagination;
    expect(paginationComponent.page).toBe(2);
    expect(paginationComponent.pageCount).toBe(2);
  });

  it('should limit pagination to 500 pages, even if more results', () => {
    // given a component
    const tester = new SearchComponentTester();
    const component = tester.componentInstance;
    tester.detectChanges();

    // when it has results
    const content: Array<DocumentModel> = [];
    for (let i = 0; i < 20; i++) {
      content.push(toRareDocument(`Bacteria ${i}`));
    }

    // in page 200 on a limited number of pages
    component.results = toSinglePage(content);
    component.results.totalElements = 12000;
    component.results.totalPages = 500;
    component.results.number = 200;
    tester.detectChanges();

    // then it should limit the pagination to 500 pages in the pagination
    // and a pagination with one page
    expect(tester.pagination).not.toBeNull();
    const paginationComponent = tester.pagination.componentInstance as NgbPagination;
    expect(paginationComponent.page).toBe(201);
    expect(paginationComponent.pageCount).toBe(500);
  });

  it('should not display pagination if no result yet', () => {
    // given a component with no result yet
    const tester = new SearchComponentTester();

    // then it should not display the pagination bar
    expect(tester.pagination).toBeNull();
  });

  it('should not display pagination if empty result', () => {
    // given a component with an empty result
    const tester = new SearchComponentTester();
    const component = tester.componentInstance;
    component.results = toSinglePage([]);
    tester.detectChanges();

    // then it should display results even if empty
    expect(tester.pagination).toBeNull();
  });

  it('should not display pagination if only one page of results', () => {
    // given a component with a single page result
    const tester = new SearchComponentTester();
    const component = tester.componentInstance;
    component.results = toSinglePage([toRareDocument('Bacteria')]);
    tester.detectChanges();

    // then it should display results even if empty
    expect(tester.pagination).toBeNull();
  });

  it('should display aggregations if there are some', () => {
    // given a component and a result with some aggregations
    const tester = new SearchComponentTester();
    const component = tester.componentInstance;
    component.results = toSinglePage(
      [toRareDocument('Bacteria')],
      [toAggregation('coo', ['France', 'Italy'])]
    );
    tester.detectChanges();

    // then it should display the aggregation
    expect(tester.aggregations).not.toBeNull();
  });

  it('should update criteria when they change', () => {
    // given a component and a result with some aggregations
    const tester = new SearchComponentTester();
    const component = tester.componentInstance;
    component.results = toSinglePage(
      [toRareDocument('Bacteria')],
      [toAggregation('coo', ['France', 'Italy'])]
    );
    tester.detectChanges();
    expect(component.aggregationCriteria.length).toBe(0);

    // when the aggregation emits an event
    const aggregationsComponent = tester.aggregations.componentInstance as AggregationsComponent;
    const criteria = [{ name: 'coo', values: ['France'] }];
    aggregationsComponent.aggregationsChange.emit(criteria);

    // then it should add a criteria
    expect(component.aggregationCriteria).toBe(criteria);

    // when the aggregation emits an event with another value
    const updatedCriteria = [{ name: 'coo', values: ['France', 'Italy'] }];
    aggregationsComponent.aggregationsChange.emit(updatedCriteria);

    // then it should update the existing criteria
    expect(component.aggregationCriteria).toBe(updatedCriteria);
  });
});
