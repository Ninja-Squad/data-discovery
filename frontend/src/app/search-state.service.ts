import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  delay,
  distinctUntilChanged,
  EMPTY,
  filter,
  ignoreElements,
  map,
  merge,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
  tap
} from 'rxjs';
import { AggregationCriterion } from './models/aggregation-criterion';
import { SearchService } from './search.service';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { Aggregation, Page } from './models/page';
import { DocumentModel } from './models/document.model';
import { catchError } from 'rxjs/operators';

export interface SortCriterion {
  sort: string;
  direction: 'asc' | 'desc';
}

export interface SearchCriteria {
  query: string;
  aggregationCriteria: Array<AggregationCriterion>;
  descendants: boolean;
  page: number;
  sortCriterion: SortCriterion | null;
  fragment: string | null;
}

function compareForAggregation(c1: SearchCriteria, c2: SearchCriteria) {
  return (
    c1.query === c2.query &&
    c1.descendants === c2.descendants &&
    c1.aggregationCriteria.length === c2.aggregationCriteria.length &&
    c1.aggregationCriteria.every(criterion1 => {
      const criterion2 = c2.aggregationCriteria.find(
        criterion => criterion.name === criterion1.name
      );
      return criterion2 && arraysEqual(criterion1.values, criterion2.values);
    })
  );
}

function arraysEqual(array1: Array<string>, array2: Array<string>) {
  return array1.length === array2.length && array1.every(element => array2.includes(element));
}

export interface Model {
  aggregationsLoading: boolean;
  aggregations: Array<Aggregation>;
  documentsLoading: boolean;
  documents: Page<DocumentModel> | null;
  searchCriteria: SearchCriteria;
  disabledAggregationName: string | null;
}

@Injectable()
export class SearchStateService {
  private transitionSubject = new Subject<(criteria: SearchCriteria) => SearchCriteria>();
  private disabledAggregationNameSubject = new BehaviorSubject<string | null>(null);

  private model$!: Observable<Model>;

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  initialize(route: ActivatedRoute): Observable<Model> {
    const queryParams$ = route.queryParamMap;
    const fragment$ = route.fragment;

    const criteria$ = combineLatest([queryParams$, fragment$]).pipe(
      map(([queryParams, fragment]) => ({
        query: this.extractQueryFromParameters(queryParams),
        aggregationCriteria: this.extractAggregationCriteriaFromParameters(queryParams),
        page: this.extractPageFromParameters(queryParams),
        descendants: this.extractDescendantsFromParameters(queryParams),
        sortCriterion: this.extractSortCriterionFromParameters(queryParams),
        fragment: fragment ?? null
      })),
      shareReplay(1)
    );

    const aggregations$: Observable<{ loading: boolean; aggregations: Array<Aggregation> }> =
      criteria$.pipe(
        distinctUntilChanged(compareForAggregation),
        switchMap(criteria => this.aggregateWithDelayedLoading(criteria))
      );

    const documents$: Observable<{ loading: boolean; documents: Page<DocumentModel> | null }> =
      criteria$.pipe(switchMap(criteria => this.searchWithDelayedLoading(criteria)));

    const model$ = combineLatest([
      criteria$,
      documents$,
      aggregations$,
      this.disabledAggregationNameSubject
    ]).pipe(
      map(([searchCriteria, documents, aggregations, disabledAggregationName]) => ({
        searchCriteria,
        documentsLoading: documents.loading,
        documents: documents.documents,
        aggregationsLoading: aggregations.loading,
        aggregations: aggregations.aggregations,
        disabledAggregationName
      }))
    );

    const navigation$ = criteria$.pipe(
      switchMap(criteria => this.transitionSubject.pipe(map(transition => transition(criteria)))),
      tap(newCriteria => {
        this.router.navigate(['.'], {
          relativeTo: route,
          queryParams: this.toQueryParams(newCriteria),
          fragment: newCriteria.fragment ?? undefined
        });
      }),
      // we will merge this observable with the model$ one so that, when subscribing to the model, we also trigger the navigation changes
      // but we don't want the events emitted by this observable to actually be emitted by the merged observable, so we ignore its elements
      ignoreElements()
    );

    this.model$ = merge(model$, navigation$).pipe(shareReplay(1));
    return this.model$;
  }

  getModel(): Observable<Model> {
    return this.model$;
  }

  getDocuments(): Observable<Page<DocumentModel>> {
    return this.model$.pipe(
      map(model => model.documents),
      filter(
        (documents: Page<DocumentModel> | null): documents is Page<DocumentModel> => !!documents
      )
    );
  }

  newSearch(query: string) {
    this.applyTransition(() => ({
      query,
      aggregationCriteria: [],
      page: 1,
      sortCriterion: null,
      descendants: false,
      fragment: null
    }));
  }

  changeAggregations(aggregationCriteria: Array<AggregationCriterion>) {
    this.applyTransition(criteria => ({
      ...criteria,
      aggregationCriteria,
      page: 1
    }));
  }

  changeSearchDescendants(descendants: boolean) {
    this.applyTransition(criteria => ({
      ...criteria,
      descendants,
      page: 1
    }));
  }

  changePage(page: number) {
    this.applyTransition(criteria => ({
      ...criteria,
      page
    }));
  }

  sort(sortCriterion: SortCriterion) {
    this.applyTransition(criteria => ({
      ...criteria,
      sortCriterion: sortCriterion,
      page: 1
    }));
  }

  applyTransition(transition: (criteria: SearchCriteria) => SearchCriteria) {
    this.transitionSubject.next(transition);
  }

  disableAggregation(aggregationName: string | null) {
    this.disabledAggregationNameSubject.next(aggregationName);
  }

  private searchWithDelayedLoading(
    criteria: SearchCriteria
  ): Observable<{ loading: boolean; documents: Page<DocumentModel> | null }> {
    const loaded$ = new Subject<void>();
    // for now, we want a short delay here so that the loader is always displayed when a search is done
    const loading$ = of({ loading: true, documents: null }).pipe(delay(10), takeUntil(loaded$));
    const search$ = this.searchService.search(criteria).pipe(
      tap(() => loaded$.next()),
      map(aggregatedPage => ({ loading: false, documents: aggregatedPage })),
      catchError(() => EMPTY)
    );

    return merge(loading$, search$);
  }

  private aggregateWithDelayedLoading(
    criteria: SearchCriteria
  ): Observable<{ loading: boolean; aggregations: Array<Aggregation> }> {
    const loaded$ = new Subject<void>();
    // for now, we want a relatively long delay here so that the loader is only displayed when it really takes time:
    // a long delay avoids a flickering effect, and also avoids losing the focus
    const loading$ = of({ loading: true, aggregations: [] }).pipe(delay(500), takeUntil(loaded$));
    const aggregations$ = this.searchService.aggregate(criteria).pipe(
      tap(() => loaded$.next()),
      map(aggregations => ({ loading: false, aggregations })),
      catchError(() => EMPTY)
    );

    return merge(loading$, aggregations$);
  }

  private extractQueryFromParameters(params: ParamMap): string {
    return params.get('query') ?? '';
  }

  private extractPageFromParameters(params: ParamMap): number {
    return +(params.get('page') ?? 1);
  }

  private extractDescendantsFromParameters(params: ParamMap): boolean {
    let descendantsParam = false;
    if (params.get('descendants') && `${params.get('descendants')}` === 'true') {
      descendantsParam = true;
    }
    return descendantsParam;
  }

  private extractAggregationCriteriaFromParameters(params: ParamMap): Array<AggregationCriterion> {
    const aggregations = params.keys.filter(
      key =>
        key !== 'query' &&
        key !== 'page' &&
        key !== 'descendants' &&
        key !== 'sort' &&
        key !== 'direction'
    );
    return aggregations.map(aggregationName => ({
      name: aggregationName,
      values: params.getAll(aggregationName)
    }));
  }

  private extractSortCriterionFromParameters(params: ParamMap): SortCriterion | null {
    const sort = params.get('sort');
    if (sort) {
      return {
        sort,
        direction: (params.get('direction') as 'asc' | 'desc') ?? 'asc'
      };
    } else {
      return null;
    }
  }

  private toQueryParams(criteria: SearchCriteria): Params {
    const result: Params = {
      query: criteria.query,
      page: criteria.page,
      descendants: criteria.descendants
    };

    criteria.aggregationCriteria.forEach(criterion => {
      result[criterion.name] = criterion.values;
    });

    if (criteria.sortCriterion) {
      result.sort = criteria.sortCriterion.sort;
      result.direction = criteria.sortCriterion.direction;
    }

    return result;
  }
}
