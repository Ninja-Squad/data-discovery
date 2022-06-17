import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Params, Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';

import { SearchService } from '../search.service';
import { environment } from '../../environments/environment';
import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { OntologyService } from '../ontology.service';

@Component({
  selector: 'dd-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  searchForm: UntypedFormGroup;
  appName = environment.name;
  suggesterTypeahead: (text$: Observable<string>) => Observable<Array<string>>;

  showAggregations = environment.home.showAggregations;
  mainAggregations$: Observable<Array<Aggregation>> = EMPTY;
  exampleQueries: Array<string> = environment.home.exampleQueries;

  constructor(
    private router: Router,
    private searchService: SearchService,
    private ontologyService: OntologyService
  ) {
    this.searchForm = new UntypedFormGroup({
      search: new UntypedFormControl()
    });
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
