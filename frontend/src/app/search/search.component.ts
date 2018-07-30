import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { EMPTY, Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { SearchService } from '../search.service';
import { GeneticResourceModel } from '../models/genetic-resource.model';
import { Aggregation, Page } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';

@Component({
  selector: 'rare-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  query = '';
  searchForm: FormGroup;
  results: Page<GeneticResourceModel>;
  suggesterTypeahead: (text$: Observable<string>) => Observable<Array<string>>;
  aggregations: Array<Aggregation> = [];
  // array of all the selected criteria
  aggregationCriteria: Array<AggregationCriterion> = [];

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
          // if it's a new query, then we also ask for the aggregations
          const aggregate = requestedQuery !== this.query;
          if (aggregate) {
            // and we reset the results and criteria
            this.results = undefined;
            this.aggregationCriteria = [];
          }
          this.query = requestedQuery;
          // set the search field
          this.searchForm.get('search').setValue(this.query);
          // extract the page if present
          const page = this.extractPageFromParameters(params);
          // extract the aggregations if there are some
          // we consider all parameters as potential aggregations, except `query` and `page`
          this.aggregationCriteria = this.extractCriteriaFromParameters(params);
          // launch the search
          return this.searchService.search(this.query, aggregate, this.aggregationCriteria, page)
          // handle a potential error, by returning no result
          // but allow to trigger a new search
            .pipe(
              catchError(() => EMPTY)
            );
        })
      )
      .subscribe(results => {
        // sets the results and the aggregations if there are some
        this.results = results;
        if (results.aggregations.length) {
          this.aggregations = results.aggregations;
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

  /**
   * Internal method called to update the URL with the new parameters (query, page, criteria).
   * It accepts a search options object with one mandatory field (the query) and optional ones (page, criteria)
   */
  private search(options: { query: string; page?: number; criteria?: Array<AggregationCriterion> }) {
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
