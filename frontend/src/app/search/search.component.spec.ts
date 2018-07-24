import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ComponentTester, fakeRoute, speculoosMatchers } from 'ngx-speculoos';

import { SearchComponent } from './search.component';
import { GeneticResourcesComponent } from '../genetic-resources/genetic-resources.component';
import { GeneticResourceComponent } from '../genetic-resource/genetic-resource.component';
import { SearchService } from '../search.service';
import { toGeneticResource, toSinglePage } from '../models/test-model-generators';

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
}

describe('SearchComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
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
    expect(searchService.search).toHaveBeenCalledWith(query);
    // and the results fetched
    expect(component.results).toEqual(results);
  });

  it('should navigate to search when a query is entered', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const searchService = TestBed.get(SearchService) as SearchService;
    spyOn(searchService, 'search');
    const activatedRoute = fakeRoute({});
    const component = new SearchComponent(activatedRoute, router, searchService);

    // with a query
    const query = 'Bacteria';
    component.searchForm.get('search').setValue(query);
    // when searching
    component.newSearch();

    // then it should redirect to the search with correct parameters
    expect(router.navigate).toHaveBeenCalledWith(['.'], { relativeTo: activatedRoute, queryParams: { query } });
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

  it('should display results', () => {
    // given a component
    const tester = new SearchComponentTester();
    const component = tester.componentInstance;

    // then it should display results even if empty
    expect(tester.results).not.toBeNull();

    // when it has results
    const resource = toGeneticResource('Bacteria');
    component.results = toSinglePage([resource]);
    tester.detectChanges();

    // then it should display them
    expect(tester.results).not.toBeNull();
    const componentInstance = tester.results.componentInstance as GeneticResourcesComponent;
    expect(componentInstance.geneticResources).toEqual(component.results);
  });
});
