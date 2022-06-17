import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NonNullableFormBuilder } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';

import { SearchService } from '../search.service';
import { environment } from '../../environments/environment';
import { Model, SearchStateService } from '../search-state.service';
import { DocumentModel } from '../models/document.model';
import { Page } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';

interface ViewModel extends Model {
  collectionSize: number;
  filtersExpanded: boolean;
}

@Component({
  selector: 'dd-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [SearchStateService]
})
export class SearchComponent {
  appName = environment.name;
  searchCtrl = this.fb.control('');
  searchForm = this.fb.group({
    search: this.searchCtrl
  });
  suggesterTypeahead: (text$: Observable<string>) => Observable<Array<string>>;

  // hide or show the filters on small devices
  private filtersExpandedSubject = new BehaviorSubject<boolean>(false);

  vm$: Observable<ViewModel>;

  constructor(
    private fb: NonNullableFormBuilder,
    private route: ActivatedRoute,
    searchService: SearchService,
    private searchStateService: SearchStateService
  ) {
    this.suggesterTypeahead = searchService.getSuggesterTypeahead();
    const model$ = searchStateService.initialize(this.route);
    this.vm$ = combineLatest([model$, this.filtersExpandedSubject]).pipe(
      map(([model, filtersExpanded]) => ({
        ...model,
        collectionSize: model.documents ? this.computeCollectionSize(model.documents) : 0,
        filtersExpanded
      })),
      tap(vm => this.searchCtrl.setValue(vm.searchCriteria.query))
    );
  }

  /**
   * Method called when the user enters a new value in the search field and submits the search form.
   * It uses the new search terms in the form, and asks for the default page (1) for this new query
   */
  newSearch() {
    const query = this.searchCtrl.value;
    this.searchStateService.newSearch(query);
  }

  /**
   * Method called when the user navigates to a different page using the pagination. It uses the current query
   * and navigates to the requested page.
   */
  navigateToPage(requestedPage: number) {
    this.searchStateService.changePage(requestedPage);
  }

  updateSearchWithAggregation(aggregationCriteria: Array<AggregationCriterion>) {
    this.searchStateService.changeAggregations(aggregationCriteria);
  }

  updateSearchWithDescendants(descendants: boolean) {
    this.searchStateService.changeSearchDescendants(descendants);
  }

  toggleFilters() {
    this.filtersExpandedSubject.next(!this.filtersExpandedSubject.getValue());
  }

  private computeCollectionSize(page: Page<DocumentModel>) {
    return Math.min(page.totalElements, page.maxResults);
  }
}
