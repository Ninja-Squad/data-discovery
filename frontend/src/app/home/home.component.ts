import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Params, Router } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';

import { SearchService } from '../search.service';
import { environment } from '../../environments/environment';
import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { NodeInformation, TreeNode } from '../faidare/tree/tree.service';
import { OntologyNodeType, OntologyPayload, OntologyService } from '../ontology.service';
import { debounceTime, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'dd-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  searchForm: FormGroup;
  appName = environment.name;
  suggesterTypeahead: (text$: Observable<string>) => Observable<Array<string>>;

  showAggregations = environment.home.showAggregations;
  mainAggregations$: Observable<Array<Aggregation>> = EMPTY;
  exampleQueries: Array<string> = environment.home.exampleQueries;

  treeFilterCtrl = new FormControl();
  debouncedFilterValue$ = this.treeFilterCtrl.valueChanges.pipe(debounceTime(400));
  tree$: Observable<Array<TreeNode>>;
  private highlightedNodeSubject = new Subject<NodeInformation>();
  highlightedNodeDetails$: Observable<{ type: OntologyNodeType; details: unknown }>;
  selectedNodes: Array<NodeInformation> | undefined;

  constructor(
    private router: Router,
    private searchService: SearchService,
    private ontologyService: OntologyService
  ) {
    this.searchForm = new FormGroup({
      search: new FormControl()
    });
    this.suggesterTypeahead = this.searchService.getSuggesterTypeahead();
    if (this.showAggregations) {
      this.mainAggregations$ = this.searchService.getMainAggregations();
    }

    this.tree$ = this.ontologyService.getTree();
    this.highlightedNodeDetails$ = this.highlightedNodeSubject.pipe(
      switchMap(nodeInformation => {
        const payload = nodeInformation.payload as OntologyPayload;
        return this.getNodeDetails(payload).pipe(map(details => ({ type: payload.type, details })));
      })
    );
  }

  private getNodeDetails(payload: OntologyPayload): Observable<unknown> {
    switch (payload.type) {
      case 'ONTOLOGY':
        return this.ontologyService.getOntology(payload.id);
      case 'TRAIT_CLASS':
        return this.ontologyService.getTraitClass(payload.id);
      case 'TRAIT':
        return this.ontologyService.getTrait(payload.id);
      case 'VARIABLE':
        return this.ontologyService.getVariable(payload.id);
    }
  }

  highlightNode(information: NodeInformation | undefined) {
    if (information) {
      this.highlightedNodeSubject.next(information);
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
