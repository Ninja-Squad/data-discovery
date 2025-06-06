import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { LargeAggregationComponent } from '../large-aggregation/large-aggregation.component';
import { SmallAggregationComponent } from '../small-aggregation/small-aggregation.component';

import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { OntologyAggregationComponent } from '../../environments/ontology-aggregation.default';

@Component({
  selector: 'dd-aggregations',
  templateUrl: './aggregations.component.html',
  styleUrl: './aggregations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LoadingSkeletonComponent,
    SmallAggregationComponent,
    LargeAggregationComponent,
    OntologyAggregationComponent
  ]
})
export class AggregationsComponent {
  readonly aggregations = input.required<Array<Aggregation> | null | undefined>();
  readonly selectedCriteria = input<Array<AggregationCriterion>>([]);
  readonly loading = input(false);
  readonly aggregationsChange = output<Array<AggregationCriterion>>();
  readonly searchDescendants = model(false);
  readonly disabledAggregationName = input<string | null>(null);

  /**
   * Extracts the selected criteria for the aggregation.
   * For example, returns [ 'France' ] for 'coo'
   * if selectedCriteria is [{ name: 'coo', values: [ 'France' ] }]
   * Returns an empty array if there are no values for this criteria
   */
  selectedKeysForAggregation(name: string): Array<string> {
    const selectedCriteria = this.selectedCriteria();
    if (selectedCriteria.length) {
      const matchingCriteria = selectedCriteria.find(criteria => criteria.name === name);
      if (matchingCriteria) {
        return matchingCriteria.values;
      }
    }
    return [];
  }

  /**
   * Finds the old criterion if it exists and replaces it with the new one received,
   * removes it if the values are empty,
   * or adds it to the criteria if it doesn't exist,
   * then emits the updated criteria.
   */
  onAggregationChange(criterionChanged: AggregationCriterion): void {
    const newSelectedCriteria = this.selectedCriteria().filter(
      criterion => criterion.name !== criterionChanged.name
    );
    newSelectedCriteria.push(criterionChanged);
    this.aggregationsChange.emit(newSelectedCriteria);
  }

  onSearchDescendantChange(event: boolean) {
    this.searchDescendants.set(event);
  }
}
