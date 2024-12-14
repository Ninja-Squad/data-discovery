import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { LargeAggregationComponent } from '../large-aggregation/large-aggregation.component';
import { SmallAggregationComponent } from '../small-aggregation/small-aggregation.component';

import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { environment } from '../../environments/environment';

@Component({
    selector: 'dd-aggregations',
    templateUrl: './aggregations.component.html',
    styleUrl: './aggregations.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LoadingSkeletonComponent,
        SmallAggregationComponent,
        LargeAggregationComponent,
        environment.ontologyAggregationComponent
    ]
})
export class AggregationsComponent {
  @Input({ required: true }) aggregations: Array<Aggregation> | null | undefined;
  @Input() selectedCriteria: Array<AggregationCriterion> = [];
  @Input() loading = false;
  @Output() aggregationsChange = new EventEmitter<Array<AggregationCriterion>>();
  @Output() searchDescendantsChange = new EventEmitter<boolean>();
  @Input() searchDescendants = false;
  @Input() disabledAggregationName: string | null = null;

  /**
   * Extracts the selected criteria for the aggregation.
   * For example, returns [ 'France' ] for 'coo'
   * if selectedCriteria is [{ name: 'coo', values: [ 'France' ] }]
   * Returns an empty array if there are no values for this criteria
   */
  selectedKeysForAggregation(name: string): Array<string> {
    if (this.selectedCriteria.length) {
      const matchingCriteria = this.selectedCriteria.find(criteria => criteria.name === name);
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
    const newSelectedCriteria = this.selectedCriteria.filter(
      criterion => criterion.name !== criterionChanged.name
    );
    newSelectedCriteria.push(criterionChanged);
    this.aggregationsChange.emit(newSelectedCriteria);
  }

  onSearchDescendantChange(event: boolean) {
    this.searchDescendants = event;
    this.searchDescendantsChange.emit(event);
  }
}
