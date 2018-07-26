import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { NgbPagination, NgbPaginationModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ComponentTester, fakeRoute, speculoosMatchers } from 'ngx-speculoos';

import { SearchComponent } from './search.component';
import { GeneticResourcesComponent } from '../genetic-resources/genetic-resources.component';
import { GeneticResourceComponent } from '../genetic-resource/genetic-resource.component';
import { SearchService } from '../search.service';
import { toGeneticResource, toSecondPage, toSinglePage } from '../models/test-model-generators';
import { GeneticResourceModel } from '../models/genetic-resource.model';

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
    return this.debugElement.query(By.directive(GeneticResourcesComponent));
  }

  get pagination() {
    return this.debugElement.query(By.directive(NgbPagination));
  }
}

describe('SearchComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,
      RouterTestingModule,
      HttpClientTestingModule,
      NgbPaginationModule.forRoot(),
      NgbTypeaheadModule.forRoot()
    ],
    declarations: [SearchComponent, GeneticResourcesComponent, GeneticResourceComponent]
  }));

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should search on init if there is a query', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const searchService = TestBed.get(SearchService) as SearchService;
    const results = toSinglePage([]);
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
    // the search service called
    expect(searchService.search).toHaveBeenCalledWith(query, 1);
    // and the results fetched
    expect(component.results).toEqual(results);
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

    // when loading
    component.ngOnInit();

    // then the search should be populated
    expect(component.searchForm.get('search').value).toBe(query);
    // the search service called
    expect(searchService.search).toHaveBeenCalledWith(query, 3);
    // and the results fetched
    expect(component.results).toEqual(results);
  });

  it('should navigate to search and reset the page to default when a query is entered', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const searchService = TestBed.get(SearchService) as SearchService;
    spyOn(searchService, 'search');
    // with a current query Rosa and a current page 2
    let query = 'Rosa';
    const queryParams = of({ query, page: 2 });
    const activatedRoute = fakeRoute({ queryParams });
    const component = new SearchComponent(activatedRoute, router, searchService);

    query = 'Bacteria';
    component.searchForm.get('search').setValue(query);
    // when searching with a new query Bacteria
    component.newSearch();

    // then it should redirect to the search with the new query and no page
    expect(router.navigate).toHaveBeenCalledWith(['.'], { relativeTo: activatedRoute, queryParams: { query, page: undefined } });
  });

  it('should navigate to requested page when pagination is used', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const searchService = TestBed.get(SearchService) as SearchService;
    spyOn(searchService, 'search');
    const query = 'Bacteria';
    const queryParams = of({ query });
    const activatedRoute = fakeRoute({ queryParams });
    const component = new SearchComponent(activatedRoute, router, searchService);
    component.query = query;

    // when navigating
    component.navigateToPage(2);

    // then it should redirect to the search with correct parameters
    expect(router.navigate).toHaveBeenCalledWith(['.'], { relativeTo: activatedRoute, queryParams: { query, page: 2 } });
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

    // then it should not display results if empty
    expect(tester.results).toBeNull();

    // when it has results
    const resource = toGeneticResource('Bacteria');
    component.results = toSecondPage([resource]);
    tester.detectChanges();

    // then it should display them
    expect(tester.results).not.toBeNull();
    const componentInstance = tester.results.componentInstance as GeneticResourcesComponent;
    expect(componentInstance.geneticResources).toEqual(component.results);

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

    // when it has results
    const content: Array<GeneticResourceModel> = [];
    for (let i = 0; i < 20; i++) {
      content.push(toGeneticResource(`Bacteria ${i}`));
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

  it('should hide results and pagination on a new search', () => {
    // given a component
    const tester = new SearchComponentTester();
    const component = tester.componentInstance;
    // with results
    const resource = toGeneticResource('Bacteria');
    component.results = toSecondPage([resource]);
    tester.detectChanges();

    // displayed
    expect(tester.results).not.toBeNull();

    // when a new search is triggered
    component.newSearch();
    tester.detectChanges();

    // then it should hide previous results
    expect(tester.results).toBeNull();

    // and pagination
    expect(tester.pagination).toBeNull();
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
    // given a component with an empty result
    const tester = new SearchComponentTester();
    const component = tester.componentInstance;
    component.results = toSinglePage([toGeneticResource('Bacteria')]);
    tester.detectChanges();

    // then it should display results even if empty
    expect(tester.pagination).toBeNull();
  });
});
