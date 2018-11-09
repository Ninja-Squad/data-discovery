import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { DocumentModel } from './models/document.model';
import { AggregatedPage } from './models/page';
import { AggregationCriterion } from './models/aggregation-criterion';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) {}

  /**
   * Searches documents for the given query (full-text search), and retrieves the given page (starting at 1)
   */
  search(query: string,
         aggregate: boolean,
         aggregationCriteria: Array<AggregationCriterion>,
         pageAsNumber: number): Observable<AggregatedPage<DocumentModel>> {
    // we decrease the page as the frontend is 1 based, and the backend 0 based.
    const page = (pageAsNumber - 1).toString();
    // we built the search parameters
    const params: { [key: string]: string | Array<string> } = { query, page, highlight: 'true' };
    // if we need to fetch the aggregation, add the `agg` parameter
    if (aggregate) {
      params.aggregate = 'true';
    }
    // if we have aggregation values, add them as domain=Plantae&domain=...
    if (aggregationCriteria) {
      aggregationCriteria.forEach(criterion => params[criterion.name] = criterion.values);
    }
    return this.http.get<AggregatedPage<DocumentModel>>('api/documents', {
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
  getSuggesterTypeahead(): ((obs: Observable<string>) => Observable<Array<string>>) {
    return (text$: Observable<string>) =>
      text$.pipe(
        map(query => query.trim()), // start by ignoring the spaces at the beginning or end of the query
        debounceTime(300), // only send a query if the user has stopped writing in the field for at least 300ms.
        distinctUntilChanged(), // avoid sending a request if the input hasn't changed (for example igf the user enters
                                // a character then backspace)
        switchMap(query => { // get the suggestions for the entered string
            if (query.length < 2) { // if the query is only one character, prefer suggesting nothing: too vague
              return of([]);
            }
            return this.suggest(query).pipe( // otherwise send a request to the server
              catchError(() => of([])) // but if the request fails, suggest nothing
            );
          }
        )
      );
  }

  private suggest(query: string): Observable<Array<string>> {
    return this.http.get<Array<string>>('api/document-suggestions', {
      params: { query }
    });
  }
}
