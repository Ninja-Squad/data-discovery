import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';

@Component({
  selector: 'dd-aggregations',
  templateUrl: './aggregations.component.html',
  styleUrls: ['./aggregations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AggregationsComponent {
  @Input() aggregations: Array<Aggregation> = [];
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

  byAggregationName(index: number, aggregation: Aggregation) {
    return aggregation.name;
  }
}
