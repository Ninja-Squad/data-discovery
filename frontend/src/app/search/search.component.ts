import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';

import { SearchService } from '../search.service';
import { environment } from '../../environments/environment';
import { Model, SearchStateService } from '../search-state.service';
import { DocumentModel } from '../models/document.model';
import { Page } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { DocumentsComponent } from '../documents/documents.component';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { AggregationsComponent } from '../aggregations/aggregations.component';
import { NgbCollapse, NgbPagination, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

interface ViewModel extends Model {
  collectionSize: number;
  filtersExpanded: boolean;
}

@Component({
  selector: 'dd-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  providers: [SearchStateService],
  imports: [
    TranslateDirective,
    TranslatePipe,
    ReactiveFormsModule,
    NgbTypeahead,
    NgbCollapse,
    AggregationsComponent,
    LoadingSkeletonComponent,
    DocumentsComponent,
    NgbPagination
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly searchStateService = inject(SearchStateService);

  readonly appName = environment.name;
  readonly searchForm = inject(NonNullableFormBuilder).group({
    search: ''
  });
  readonly suggesterTypeahead: (text$: Observable<string>) => Observable<Array<string>>;

  // hide or show the filters on small devices
  private readonly filtersExpandedSubject = new BehaviorSubject<boolean>(false);

  readonly vm: Signal<ViewModel | undefined>;

  constructor() {
    const searchService = inject(SearchService);

    this.suggesterTypeahead = searchService.getSuggesterTypeahead();
    const model$ = this.searchStateService.initialize(this.route);
    this.vm = toSignal(
      combineLatest([model$, this.filtersExpandedSubject]).pipe(
        map(([model, filtersExpanded]) => ({
          ...model,
          collectionSize: model.documents ? this.computeCollectionSize(model.documents) : 0,
          filtersExpanded
        })),
        tap(vm => this.searchForm.controls.search.setValue(vm.searchCriteria.query))
      )
    );
  }

  /**
   * Method called when the user enters a new value in the search field and submits the search form.
   * It uses the new search terms in the form, and asks for the default page (1) for this new query
   */
  newSearch() {
    const query = this.searchForm.controls.search.value;
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
