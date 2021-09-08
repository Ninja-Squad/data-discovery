import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

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
export class SmallAggregationComponent implements OnInit {
  @Input() aggregation!: Aggregation;
  @Input() searchDescendants = false;
  private _selectedKeys: Array<string> = [];
  // the component emits an event if the user adds or remove a criterion
  @Output() aggregationChange = new EventEmitter<AggregationCriterion>();
  @Output() searchDescendantsChange = new EventEmitter<boolean>();

  aggregationForm: FormGroup = new FormGroup({});

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

  ngOnInit(): void {
    // create as many form control as there are buckets
    const buckets = this.aggregation.buckets;
    buckets.map(bucket => {
      const control = new FormControl(false);
      // if the criteria is selected, set the field to true
      if (this._selectedKeys.includes(bucket.key)) {
        control.setValue(true);
      }
      this.aggregationForm.addControl(bucket.key, control);
    });

    if (buckets.length <= 1) {
      this.aggregationForm.disable();
    }

    // subscribe to form changes
    // to emit a new event every time a value changes
    this.aggregationForm.valueChanges.subscribe(formValues => {
      const values = SmallAggregationComponent.extractKeys(formValues);
      const event: AggregationCriterion = {
        name: this.aggregation.name,
        values
      };
      this.aggregationChange.emit(event);
    });
  }

  @Input()
  set selectedKeys(newSelectedKeys: Array<string>) {
    if (!SmallAggregationComponent.sameSelectedKeys(this._selectedKeys, newSelectedKeys)) {
      this._selectedKeys = newSelectedKeys;
      for (const [key, control] of Object.entries(this.aggregationForm.controls)) {
        control.setValue(newSelectedKeys.includes(key), { emitEvent: false });
      }
    }
  }

  get selectedKeys() {
    return this._selectedKeys;
  }

  displayableKey(key: string): string {
    return key === NULL_VALUE ? this.translateService.instant(NULL_VALUE_TRANSLATION_KEY) : key;
  }

  onSearchDescendants(event: boolean) {
    this.searchDescendants = event;
    this.searchDescendantsChange.emit(event);
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
