import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ComponentTester } from 'ngx-speculoos';

import { HomeComponent } from './home.component';
import { SearchService } from '../search.service';
import { PillarsComponent } from '../pillars/pillars.component';
import { AggregationsComponent } from '../aggregations/aggregations.component';
import { of } from 'rxjs';
import { Aggregation } from '../models/page';
import { environment } from '../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideI18nTesting } from '../i18n/mock-18n.spec';

class HomeComponentTester extends ComponentTester<HomeComponent> {
  constructor() {
    super(HomeComponent);
  }

  get searchBar() {
    return this.input('input');
  }

  get searchButton() {
    return this.button('button');
  }

  get pillarsComponent() {
    return this.element(PillarsComponent);
  }

  get exampleQueriesSection() {
    return this.element('.example-queries');
  }

  get exampleQueries() {
    return this.elements<HTMLAnchorElement>('.example-queries a');
  }

  get aggregations(): AggregationsComponent | null {
    return this.component(AggregationsComponent);
  }
}

describe('HomeComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
        provideRouter([])
      ]
    })
  );

  describe('when not showing aggregations', () => {
    it('should navigate to search when a query is entered', () => {
      // given a component
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');

      const component = new HomeComponentTester().componentInstance;

      // with a query
      const query = 'Bacteria';
      const descendants = false;
      component.searchForm.get('search')!.setValue(query);
      // when searching
      component.search();

      // then it should redirect to the search with correct parameters
      expect(router.navigate).toHaveBeenCalledWith(['/search'], {
        queryParams: { query, descendants }
      });
    });

    it('should display a search bar and trigger a search', () => {
      // given a component
      const tester = new HomeComponentTester();
      const component = tester.componentInstance;
      spyOn(component, 'search');

      // then it should display the search bar containing that query
      tester.detectChanges();

      expect(tester.searchBar).toHaveValue('');

      // with a query
      const query = 'Bacteria';
      tester.searchBar.fillWith(query);

      // trigger search
      tester.searchButton.click();
      expect(component.search).toHaveBeenCalled();
      expect(component.searchForm.get('search').value).toBe(query);
    });

    it('should display the pillars', () => {
      const tester = new HomeComponentTester();
      tester.detectChanges();

      expect(tester.pillarsComponent).not.toBeNull();
      expect(tester.aggregations).toBeNull();
    });

    it('should display example queries if there are some', () => {
      const tester = new HomeComponentTester();
      tester.detectChanges();

      expect(tester.exampleQueriesSection).toBeNull();

      tester.componentInstance.exampleQueries = ['foo', 'bar'];
      tester.detectChanges();

      expect(tester.exampleQueriesSection).not.toBeNull();
      expect(tester.exampleQueries.length).toBe(2);
      expect(tester.exampleQueries[0]).toHaveText('foo');
      expect(tester.exampleQueries[0].attr('href')).toBe('/search?query=foo');
    });
  });

  describe('when showing aggregations', () => {
    beforeEach(() => {
      environment.home.showAggregations = true;
    });

    afterEach(() => {
      environment.home.showAggregations = false;
    });

    it('should display aggregations and navigate to search when an aggregation is selected', () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');

      const searchService = TestBed.inject(SearchService);
      const aggregations: Array<Aggregation> = [
        {
          name: 'coo',
          type: 'LARGE',
          buckets: [
            {
              key: 'France',
              documentCount: 18
            },
            {
              key: 'Italy',
              documentCount: 3
            }
          ]
        }
      ];
      spyOn(searchService, 'getMainAggregations').and.returnValue(of(aggregations));

      const tester = new HomeComponentTester();
      tester.detectChanges();

      expect(tester.pillarsComponent).toBeNull();
      expect(tester.aggregations).not.toBeNull();
      expect(tester.aggregations.aggregations).toBe(aggregations);

      tester.aggregations.aggregationsChange.emit([
        {
          name: 'coo',
          values: ['Italy']
        }
      ]);

      // then it should redirect to the search with correct parameters
      expect(router.navigate).toHaveBeenCalledWith(['/search'], {
        queryParams: { descendants: false, coo: ['Italy'] }
      });
    });
  });
});
