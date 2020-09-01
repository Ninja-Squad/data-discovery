import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';
import {EMPTY, merge, Observable} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';

import {SearchService} from '../search.service';
import {DocumentModel} from '../models/document.model';
import {Aggregation, Page} from '../models/page';
import {AggregationCriterion} from '../models/aggregation-criterion';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {environment} from '../../environments/environment';

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
  searchLoading = true;
  aggLoading = true;
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
  searchDescendants = false ;

  constructor(private route: ActivatedRoute, private router: Router, private searchService: SearchService) {
    this.searchForm = new FormGroup({
      search: new FormControl()
    });
  }


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
          }

          this.query = requestedQuery;
          // set the search field
          this.searchForm.get('search').setValue(this.query);
          // extract the page if present
          const page = this.extractPageFromParameters(params);
          // extract the aggregations if there are some
          // we consider all parameters as potential aggregations, except `query` and `page` and `descendants`
          this.aggregationCriteria = this.extractCriteriaFromParameters(params);
          // Handle descendants param
          this.searchDescendants = this.extractDescendantsFromParameters(params);
          // launch the search and handle a potential error, by returning no result
          // but allow to trigger a new search
          return merge(
            this.searchService.search(this.query, this.aggregationCriteria, page, this.searchDescendants)
              .pipe(
                catchError(() => EMPTY),
              ),
            this.searchService.aggregate(this.query, this.aggregationCriteria, this.searchDescendants)
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

  /*extractDescendantsFromParameters(): boolean {
    const descendantsParam = this.route.snapshot.queryParamMap.get('descendants');
    return this.searchDescendants = descendantsParam === 'true';
  }*/

  extractDescendantsFromParameters(params: ParamMap): boolean {
    let descendantsParam = false;
    if (params.get('descendants') && params.get('descendants') === 'true') {
      descendantsParam = true;
    }
    return descendantsParam;
  }

  extractCriteriaFromParameters(params: ParamMap): Array<AggregationCriterion> {
    const aggregations = params.keys.filter(key => key !== 'query' && key !== 'page' && key !== 'descendants');
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
    // const descendants = this.extractDescendantsFromParameters();
    if (!(query === this.query)) {
      // Add the following conditions if we don't reset aggregations on new search anymore && (
      //       (options.criteria === this.aggregationCriteria)
      //       || (!options.criteria && this.aggregationCriteria.length === 0 )
      //     )
      // )
      this.setPleaseWaitWidgetsOn();
    }
    this.search({query});
  }

  /**
   * Method called when the user navigates to a different page using the pagination. It uses the current query
   * and navigates to the requested page.
   */
  navigateToPage(requestedPage: number) {
    this.setPleaseWaitWidgetsOn();
    this.search({query: this.query, page: requestedPage, criteria: this.aggregationCriteria, descendants: this.searchDescendants});
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
    this.setPleaseWaitWidgetsOn(true);
    this.search({query: this.query, criteria: this.aggregationCriteria, descendants: this.searchDescendants});
  }

  updateSearchWithDescendants(event: boolean) {
    this.searchDescendants = event;
    this.search({query: this.query, criteria: this.aggregationCriteria, descendants: this.searchDescendants});
  }

  toggleFilters() {
    this.filters = this.filters === 'show' ? 'hide' : 'show';
  }

  /**
   * Internal method called to update the URL with the new parameters (query, page, criteria).
   * It accepts a search options object with one mandatory field (the query) and optional ones (page, criteria)
   */
  private search(options: { query: string; page?: number; criteria?: Array<AggregationCriterion>, descendants?: boolean }) {
    const queryParams: { [key: string]: string | Array<string> } = {
      query: options.query,
      page: options.page ? options.page.toString() : undefined,
      descendants: options.descendants ? options.descendants.toString() : 'false'
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

  private setPleaseWaitWidgetsOn(searchOnly: boolean = false) {
    this.searchLoading = true;
    if (!searchOnly) {
      this.aggLoading = true;
    }
  }
}
