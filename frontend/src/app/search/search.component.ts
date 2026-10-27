import { ChangeDetectionStrategy, Component, inject, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { NgbCollapse, NgbPagination, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AggregationsComponent } from '../aggregations/aggregations.component';
import { DocumentsComponent } from '../documents/documents.component';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { DocumentModel } from '../models/document.model';
import { Page } from '../models/page';
import { Model, SearchStateService } from '../search-state.service';
import { SearchService } from '../search.service';

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
    FormField,
    FormRoot,
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
  private readonly searchFormValue = signal({
    search: ''
  });
  readonly searchForm = form(this.searchFormValue, {
    submission: {
      action: async () => {
        this.newSearch();
        return undefined;
      }
    }
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
        tap(vm => this.searchFormValue.set({ search: vm.searchCriteria.query }))
      )
    );
  }

  /**
   * Method called when the user enters a new value in the search field and submits the search form.
   * It uses the new search terms in the form, and asks for the default page (1) for this new query
   */
  newSearch() {
    const query = this.searchFormValue().search;
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
