import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  switchMap
} from 'rxjs';

import { DocumentModel } from './models/document.model';
import { Aggregation, Page } from './models/page';
import { AggregationCriterion } from './models/aggregation-criterion';
import { SortCriterion } from './search-state.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);

  /**
   * Searches documents for the given query (full-text search), and retrieves the given page (starting at 1)
   */
  search(criteria: {
    query: string;
    aggregationCriteria: Array<AggregationCriterion>;
    page: number;
    descendants: boolean;
    sortCriterion: SortCriterion | null;
  }): Observable<Page<DocumentModel>> {
    // we decrease the page as the frontend is 1 based, and the backend 0 based.
    const page = criteria.page - 1;
    // we built the search parameters
    const params: Record<string, string | number | ReadonlyArray<string> | boolean> = {
      query: criteria.query,
      page,
      highlight: true,
      descendants: criteria.descendants
    };
    if (criteria.sortCriterion) {
      params.sort = criteria.sortCriterion.sort;
      params.direction = criteria.sortCriterion.direction;
    }

    // if we have aggregation values, add them as domain=Plantae&domain=...
    if (criteria.aggregationCriteria) {
      criteria.aggregationCriteria.forEach(
        criterion => (params[criterion.name] = criterion.values)
      );
    }
    return this.http.get<Page<DocumentModel>>('api/search', {
      params
    });
  }

  /**
   * Aggregates documents for the given query (full-text search), and return an Aggregated page with aggregations and without results
   */
  aggregate(criteria: {
    query: string;
    aggregationCriteria: Array<AggregationCriterion>;
    descendants: boolean;
  }): Observable<Array<Aggregation>> {
    // we built the search parameters
    const params: Record<string, string | ReadonlyArray<string> | boolean> = {
      query: criteria.query,
      descendants: criteria.descendants
    };
    // if we have aggregation values, add them as domain=Plantae&domain=...
    if (criteria.aggregationCriteria) {
      criteria.aggregationCriteria.forEach(
        criterion => (params[criterion.name] = criterion.values)
      );
    }
    return this.http.get<Array<Aggregation>>('api/aggregate', {
      params
    });
  }

  /**
   * Returns what the NgbTypeahead directive, used for search term suggestions, needs as an input
   * (see https://ng-bootstrap.github.io/#/components/typeahead/api), i.e. a function that takes an Observable<string>
   * as argument, representing the stream of values entered in the search field, and returns an
   * Observable<Array<string>>, representing the stream of suggestions to display for each string emitted by the
   * observable taken as argument.
   */
  getSuggesterTypeahead(): (obs: Observable<string>) => Observable<Array<string>> {
    return (text$: Observable<string>) =>
      text$.pipe(
        map(query => query.trim()), // start by ignoring the spaces at the beginning or end of the query
        debounceTime(300), // only send a query if the user has stopped writing in the field for at least 300ms.
        distinctUntilChanged(), // avoid sending a request if the input hasn't changed (for example igf the user enters
        // a character then backspace)
        switchMap(query => {
          // get the suggestions for the entered string
          if (query.length < 2) {
            // if the query is only one character, prefer suggesting nothing: too vague
            return of([]);
          }

          return this.suggest(query).pipe(
            // otherwise send a request to the server
            catchError(() => of([])) // but if the request fails, suggest nothing
          );
        })
      );
  }

  private suggest(query: string): Observable<Array<string>> {
    return this.http.get<Array<string>>('api/suggest', {
      params: { query }
    });
  }

  getMainAggregations(): Observable<Array<Aggregation>> {
    return this.http.get<Array<Aggregation>>('api/aggregate', {
      params: { main: true }
    });
  }
}
