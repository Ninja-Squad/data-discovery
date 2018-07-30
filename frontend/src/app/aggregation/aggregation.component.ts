import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';

@Component({
  selector: 'rare-aggregation',
  templateUrl: './aggregation.component.html',
  styleUrls: ['./aggregation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AggregationComponent implements OnInit {

  @Input() aggregation: Aggregation;
  @Input() selectedKeys: Array<string> = [];
  // the component emits an event if the user adds or remove a criterion
  @Output() aggregationChange = new EventEmitter<AggregationCriterion>();

  aggregationForm: FormGroup = new FormGroup({});

  /**
   * This extracts the keys with a truthy value from an object.
   * For example,
   * { France: true, England: false, 'New Zealand': null }
   * returns
   * [ 'France' ]
   */
  static extractKeys(formValues: { [key: string]: boolean | null }) {
    return Object.entries<boolean>(formValues)
      .filter(([key, value]) => value)
      .map(([key]) => key);
  }

  ngOnInit(): void {
    // create as many form control as there are buckets
    const buckets = this.aggregation.buckets;
    buckets.map(bucket => {
      const control = new FormControl(false);
      // if the criteria is selected, set the field to true
      if (this.selectedKeys.includes(bucket.key)) {
        control.setValue(true);
      }
      this.aggregationForm.addControl(bucket.key, control);
    });
    // disable if only one bucket
    if (buckets.length === 1) {
      this.aggregationForm.disable();
    }

    // subscribe to form changes
    // to emit a new event every time a value changes
    this.aggregationForm.valueChanges.subscribe(formValues => {
      const values = AggregationComponent.extractKeys(formValues);
      const event: AggregationCriterion = {
        name: this.aggregation.name,
        values
      };
      this.aggregationChange.emit(event);
    });
  }
}
