import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import {EMPTY, merge, Observable} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';

import { SearchService } from '../search.service';
import { DocumentModel } from '../models/document.model';
import { Aggregation, Page } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { environment } from '../../environments/environment';

@Component({
  selector: 'dd-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: [
    /**
     * Animation triggered when the filters are show/hidden
     * on small devices.
     */
    trigger('showHide', [
      state('show', style({
        height: '*'
      })),
      state('hide', style({
        height: 0
      })),
      transition('show => hide', [
        animate('500ms ease-out')
      ]),
      transition('hide => show', [
        animate('500ms ease-in')
      ])
    ])
  ]
})
export class SearchComponent implements OnInit {
  loading = true;
  searchLoading = true;
  aggLoading = true; //TODO: Deprecated? Synch through aggArray length
  query = '';
  placeholder = environment.searchPlaceholder;
  searchForm: FormGroup;
  results: Page<DocumentModel>;
  suggesterTypeahead: (text$: Observable<string>) => Observable<Array<string>>;
  aggregations: Array<Aggregation> = [];
  // array of all the selected criteria
  aggregationCriteria: Array<AggregationCriterion> = [];
  // hide or show the filters on small devices
  filters: 'show' | 'hide' = 'hide';

  constructor(private route: ActivatedRoute, private router: Router, private searchService: SearchService) {
    this.searchForm = new FormGroup({
      search: new FormControl()
    });
  }

  // https://stackoverflow.com/questions/44412809/angular2-which-is-the-best-way-to-make-multiple-sync-calls-with-observables
  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        // extract parameters
        switchMap(params => {
          const requestedQuery = params.get('query');
          if (this.query !== requestedQuery) {
            // we reset the results and criteria
            this.results = undefined;
            this.aggregationCriteria = [];
          } else {
            this.searchLoading = false;
            this.aggLoading = false;
          }
          this.query = requestedQuery;
          // set the search field
          this.searchForm.get('search').setValue(this.query);
          // extract the page if present
          const page = this.extractPageFromParameters(params);
          // extract the aggregations if there are some
          // we consider all parameters as potential aggregations, except `query` and `page`
          this.aggregationCriteria = this.extractCriteriaFromParameters(params);
          // launch the search and handle a potential error, by returning no result
          // but allow to trigger a new search
          return merge(
             this.searchService.search(this.query,  this.aggregationCriteria, page)
                .pipe(
                  catchError(() => EMPTY),
                ),
              this.searchService.aggregate(this.query,  this.aggregationCriteria)
              .pipe(
                catchError(() => EMPTY)
              )
            );
        }))
      .subscribe(results => {
        // this.loading = false;
        if (results.aggregations.length) {
          this.aggLoading = false;
          // sets the aggregations if there are some
          this.aggregations = results.aggregations;

        } else {
          this.searchLoading = false;
          this.results = results;
        }
      });
    this.suggesterTypeahead = this.searchService.getSuggesterTypeahead();
  }

  extractPageFromParameters(params: ParamMap): number {
    let page = 1;
    if (params.get('page')) {
      page = +params.get('page');
    }
    return page;
  }

  extractCriteriaFromParameters(params: ParamMap): Array<AggregationCriterion> {
    const aggregations = params.keys.filter(key => key !== 'query' && key !== 'page');
    return aggregations.map(aggregationName => ({
      name: aggregationName,
      values: params.getAll(aggregationName)
    }));
  }

  /**
   * Method called when the user enters a new value in the search field and submits the search form.
   * It uses the new search terms in the form, and asks for the default page (1) for this new query
   */
  newSearch() {
    const query = this.searchForm.get('search').value;
    this.search({ query });
  }

  /**
   * Method called when the user navigates to a different page using the pagination. It uses the current query
   * and navigates to the requested page.
   */
  navigateToPage(requestedPage: number) {
    this.search({ query: this.query, page: requestedPage, criteria: this.aggregationCriteria });
  }

  collectionSize() {
    return Math.min(this.results.totalElements, this.results.maxResults);
  }

  /**
   * Method called when the user adds or removes aggregation criteria.
   * It uses the event emitted by {@link AggregationsComponent}
   * and updates the array containing all the criteria with the new criteria.
   */
  updateSearchWithAggregation(criteria: Array<AggregationCriterion>) {
    this.aggregationCriteria = criteria;
    this.search({ query: this.query, criteria: this.aggregationCriteria });
  }

  toggleFilters() {
    this.filters = this.filters === 'show' ? 'hide' : 'show';
  }

  /**
   * Internal method called to update the URL with the new parameters (query, page, criteria).
   * It accepts a search options object with one mandatory field (the query) and optional ones (page, criteria)
   */
  private search(options: { query: string; page?: number; criteria?: Array<AggregationCriterion> }) {
    // this.loading = true; // TODO: deprecated
    this.searchLoading = true;
    this.aggLoading = true;
    const queryParams: { [key: string]: string | Array<string> } = {
      query: options.query,
      page: options.page ? options.page.toString() : undefined
    };
    // we iterate over each criteria if necessary
    if (options.criteria) {
      options.criteria
        .forEach(criteria => queryParams[criteria.name] = criteria.values);
    }
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams
    });
  }
}
