import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Params, Router, RouterLink } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';

import { SearchService } from '../search.service';
import { environment } from '../../environments/environment';
import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { AggregationsComponent } from '../aggregations/aggregations.component';
import { PillarsComponent } from '../pillars/pillars.component';
import { AsyncPipe } from '@angular/common';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dd-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  imports: [
    RouterLink,
    AsyncPipe,
    ReactiveFormsModule,
    TranslateModule,
    NgbTypeahead,
    PillarsComponent,
    AggregationsComponent,
    environment.headerComponent
  ]
})
export class HomeComponent {
  searchForm = this.fb.group({
    search: ''
  });
  appName = environment.name;
  suggesterTypeahead: (text$: Observable<string>) => Observable<Array<string>>;

  showAggregations = environment.home.showAggregations;
  mainAggregations$: Observable<Array<Aggregation>> = EMPTY;
  exampleQueries: Array<string> = environment.home.exampleQueries;

  constructor(
    private fb: NonNullableFormBuilder,
    private router: Router,
    private searchService: SearchService
  ) {
    this.suggesterTypeahead = this.searchService.getSuggesterTypeahead();
    if (this.showAggregations) {
      this.mainAggregations$ = this.searchService.getMainAggregations();
    }
  }

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
