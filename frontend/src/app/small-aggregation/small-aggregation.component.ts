import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { NULL_VALUE, NULL_VALUE_TRANSLATION_KEY } from '../models/document.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dd-small-aggregation',
  templateUrl: './small-aggregation.component.html',
  styleUrls: ['./small-aggregation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallAggregationComponent implements OnChanges {
  @Input() aggregation!: Aggregation;
  @Input() searchDescendants = false;
  @Input() selectedKeys: Array<string> = [];
  // the component emits an event if the user adds or remove a criterion
  @Output() aggregationChange = new EventEmitter<AggregationCriterion>();
  @Output() searchDescendantsChange = new EventEmitter<boolean>();
  @Input() disabled = false;

  aggregationForm: UntypedFormGroup = new UntypedFormGroup({});

  /**
   * This extracts the keys with a truthy value from an object.
   * For example,
   * { France: true, England: false, 'New Zealand': null }
   * returns
   * [ 'France' ]
   */
  static extractKeys(formValues: { [key: string]: boolean | null }) {
    return (
      Object.entries<boolean | null>(formValues)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([key, value]) => value)
        .map(([key]) => key)
    );
  }

  static sameSelectedKeys(a: Array<string>, b: Array<string>) {
    if (a.length !== b.length) {
      return false;
    }

    const secondSet = new Set(b);

    return a.every(value => secondSet.has(value));
  }

  constructor(private translateService: TranslateService) {}

  ngOnChanges(): void {
    // create as many form control as there are buckets
    const buckets = this.aggregation.buckets;
    buckets.forEach(bucket => {
      let control = this.aggregationForm.get(bucket.key);
      if (!control) {
        control = new UntypedFormControl(false);
        this.aggregationForm.addControl(bucket.key, control);
      }
      (control as UntypedFormControl).setValue(this.selectedKeys.includes(bucket.key));
    });
    Object.keys(this.aggregationForm.controls).forEach(key => {
      if (!buckets.find(bucket => bucket.key === key)) {
        this.aggregationForm.removeControl(key);
      }
    });

    if (this.disabled || this.aggregation.buckets.length <= 1) {
      this.aggregationForm.disable();
    } else {
      this.aggregationForm.enable();
    }
  }

  displayableKey(key: string): string {
    return key === NULL_VALUE ? this.translateService.instant(NULL_VALUE_TRANSLATION_KEY) : key;
  }

  onSearchDescendants(event: boolean) {
    this.searchDescendants = event;
    this.searchDescendantsChange.emit(event);
  }

  onChange() {
    const values = SmallAggregationComponent.extractKeys(this.aggregationForm.value);
    const event: AggregationCriterion = {
      name: this.aggregation.name,
      values
    };
    this.aggregationChange.emit(event);
  }

  /**
   * The aggregation is hidden if there are no buckets or if the only bucket is the NULL_VALUE bucket
   */
  get hideAggregation() {
    return (
      this.aggregation.buckets.length === 0 ||
      (this.aggregation.buckets.length === 1 && this.aggregation.buckets[0].key === NULL_VALUE)
    );
  }
}
