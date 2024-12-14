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
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'dd-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TranslateModule,
    NgbTypeahead,
    PillarsComponent,
    AggregationsComponent,
    environment.headerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private router = inject(Router);
  private searchService = inject(SearchService);

  searchForm = inject(NonNullableFormBuilder).group({
    search: ''
  });
  appName = environment.name;
  suggesterTypeahead: (text$: Observable<string>) => Observable<Array<string>> =
    this.searchService.getSuggesterTypeahead();

  showAggregations = environment.home.showAggregations;
  mainAggregations: Signal<Array<Aggregation> | undefined> = this.showAggregations
    ? toSignal(this.searchService.getMainAggregations())
    : signal([]);
  exampleQueries: Array<string> = environment.home.exampleQueries;

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
