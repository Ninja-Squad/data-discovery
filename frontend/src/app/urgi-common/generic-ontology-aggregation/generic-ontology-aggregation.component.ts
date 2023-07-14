import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Aggregation } from '../../models/page';
import { AggregationCriterion } from '../../models/aggregation-criterion';

/**
 * This is a fake component that does nothing, because it's never displayed in applications, except on faidare which has an ontology
 * aggregation, where it's replaced by a component with the same selector, inputs and outputs.
 */
@Component({
  selector: 'dd-ontology-aggregation',
  templateUrl: './generic-ontology-aggregation.component.html',
  styleUrls: ['./generic-ontology-aggregation.component.scss'],
  standalone: true
})
export class GenericOntologyAggregationComponent {
  @Input() aggregation!: Aggregation;
  @Output() aggregationChange = new EventEmitter<AggregationCriterion>();
  @Input() selectedKeys: Array<string> = [];
  @Input() disabled = false;
}
