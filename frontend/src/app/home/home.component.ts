import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Params, Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';

import { SearchService } from '../search.service';
import { environment } from '../../environments/environment';
import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { NodeInformation, TreeNode } from '../faidare/tree/tree.service';

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
  tree: Array<TreeNode>;
  highlightedNode: NodeInformation | undefined;
  selectedNodes: Array<NodeInformation> | undefined;

  constructor(private router: Router, private searchService: SearchService) {
    this.searchForm = new FormGroup({
      search: new FormControl()
    });
    this.suggesterTypeahead = this.searchService.getSuggesterTypeahead();
    if (this.showAggregations) {
      this.mainAggregations$ = this.searchService.getMainAggregations();
    }

    this.tree = this.createTree();
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

  private createTree(): Array<TreeNode> {
    return [
      {
        text: 'A',
        children: [
          {
            text: 'A1',
            children: [
              {
                text: 'A11',
                payload: {
                  type: 'foo'
                }
              },
              {
                text: 'A12'
              }
            ]
          },
          {
            text: 'A2',
            children: [
              {
                text: 'A21'
              },
              {
                text: 'A22'
              }
            ]
          }
        ]
      },
      {
        text: 'B',
        children: [
          {
            text: 'C1',
            children: [
              {
                text: 'B11',
                selected: true
              },
              {
                text: 'B12',
                selected: true
              }
            ]
          },
          {
            text: 'B2',
            children: [
              {
                text: 'C21'
              },
              {
                text: 'C22'
              }
            ]
          }
        ]
      }
    ];
  }
}
