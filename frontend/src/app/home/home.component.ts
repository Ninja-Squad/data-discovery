import { ChangeDetectionStrategy, Component, inject, signal, Signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Params, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { SearchService } from '../search.service';
import { environment } from '../../environments/environment';
import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { AggregationsComponent } from '../aggregations/aggregations.component';
import { PillarsComponent } from '../pillars/pillars.component';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeaderComponent } from '../../environments/header.default';

@Component({
  selector: 'dd-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TranslateDirective,
    TranslatePipe,
    NgbTypeahead,
    PillarsComponent,
    AggregationsComponent,
    HeaderComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);

  readonly searchForm = inject(NonNullableFormBuilder).group({
    search: ''
  });
  readonly appName = environment.name;
  readonly suggesterTypeahead: (text$: Observable<string>) => Observable<Array<string>> =
    this.searchService.getSuggesterTypeahead();

  readonly showAggregations = environment.home.showAggregations;
  readonly mainAggregations: Signal<Array<Aggregation> | undefined> = this.showAggregations
    ? toSignal(this.searchService.getMainAggregations())
    : signal([]);
  readonly exampleQueries: Array<string> = environment.home.exampleQueries;

  search() {
    this.router.navigate(['/search'], {
      queryParams: {
        query: this.searchForm.get('search')!.value,
        descendants: false
      }
    });
  }

  aggregationsChanged(criteria: Array<AggregationCriterion>) {
    const queryParams: Params = {
      descendants: false
    };
    criteria.forEach(criterion => (queryParams[criterion.name] = criterion.values));
    this.router.navigate(['/search'], { queryParams });
  }
}
