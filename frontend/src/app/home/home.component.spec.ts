import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { HomeComponent } from './home.component';
import { SearchService } from '../search.service';
import { of } from 'rxjs';
import { Aggregation } from '../models/page';
import { environment } from '../../environments/environment';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideI18nTesting } from '../i18n/mock-18n';
import { Component, ChangeDetectionStrategy } from '@angular/core';

class HomeComponentTester {
  readonly fixture = TestBed.createComponent(HomeComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly searchBar = page.getByCss('input');
  readonly searchButton = page.getByCss('button');
  readonly pillarsComponent = page.getByCss('dd-pillars');
  readonly exampleQueriesSection = page.getByCss('.example-queries');
  readonly exampleQueries = page.getByCss('.example-queries a');
  readonly aggregationsComponent = page.getByCss('dd-aggregations');
}

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class FakeSearchComponent {}

describe('HomeComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideI18nTesting(),
        provideRouter([{ path: 'search', component: FakeSearchComponent }])
      ]
    })
  );

  describe('when not showing aggregations', () => {
    test('should navigate to search when a query is entered', () => {
      // given a component
      const router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate');

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

    test('should display a search bar and trigger a search', async () => {
      // given a component
      const tester = new HomeComponentTester();
      const component = tester.componentInstance;
      vi.spyOn(component, 'search');

      // then it should display the search bar containing that query
      await expect.element(tester.searchBar).toBeVisible();
      await expect.element(tester.searchBar).toHaveValue('');

      // with a query
      const query = 'Bacteria';
      await tester.searchBar.fill(query);

      // trigger search
      await tester.searchButton.click();
      expect(component.search).toHaveBeenCalled();
      expect(component.searchForm.get('search').value).toBe(query);
    });

    test('should display the pillars', async () => {
      const tester = new HomeComponentTester();

      await expect.element(tester.pillarsComponent).toBeInTheDocument();
      await expect.element(tester.aggregationsComponent).not.toBeInTheDocument();
    });

    test('should not display example queries if there are none', async () => {
      environment.home.exampleQueries = [];
      const tester = new HomeComponentTester();

      await expect.element(tester.exampleQueriesSection).not.toBeInTheDocument();
    });

    test('should display example queries if there are some', async () => {
      environment.home.exampleQueries = ['foo', 'bar'];
      const tester = new HomeComponentTester();

      await expect.element(tester.exampleQueriesSection).toBeInTheDocument();
      expect(tester.exampleQueries).toHaveLength(2);
      await expect.element(tester.exampleQueries.nth(0)).toHaveTextContent('foo');
      await expect(tester.exampleQueries.nth(0).element().getAttribute('href')).toBe(
        '/search?query=foo'
      );
    });
  });

  describe('when showing aggregations', () => {
    beforeEach(() => {
      environment.home.showAggregations = true;
    });

    afterEach(() => {
      environment.home.showAggregations = false;
    });

    test('should display aggregations and navigate to search when an aggregation is selected', async () => {
      const router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate');

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
      vi.spyOn(searchService, 'getMainAggregations').mockReturnValue(of(aggregations));

      const tester = new HomeComponentTester();
      await tester.fixture.whenStable();

      await expect.element(tester.pillarsComponent).not.toBeInTheDocument();
      await expect.element(tester.aggregationsComponent).toBeInTheDocument();
      expect(tester.componentInstance.mainAggregations()).toBe(aggregations);

      tester.componentInstance.aggregationsChanged([
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
