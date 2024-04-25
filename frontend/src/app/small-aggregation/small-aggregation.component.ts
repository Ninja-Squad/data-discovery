import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import {
  FormControl,
  FormRecord,
  NonNullableFormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { NULL_VALUE, NULL_VALUE_TRANSLATION_KEY } from '../models/document.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AggregationNamePipe } from '../aggregation-name.pipe';
import { DescendantsCheckboxComponent } from '../descendants-checkbox/descendants-checkbox.component';
import { DocumentCountComponent } from '../document-count/document-count.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'dd-small-aggregation',
  templateUrl: './small-aggregation.component.html',
  styleUrl: './small-aggregation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgbTooltip,
    ReactiveFormsModule,
    DocumentCountComponent,
    DescendantsCheckboxComponent,
    TranslateModule,
    AggregationNamePipe
  ]
})
export class SmallAggregationComponent implements OnChanges {
  @Input() aggregation!: Aggregation;
  @Input() searchDescendants = false;
  @Input() selectedKeys: Array<string> = [];
  // the component emits an event if the user adds or remove a criterion
  @Output() aggregationChange = new EventEmitter<AggregationCriterion>();
  @Output() searchDescendantsChange = new EventEmitter<boolean>();
  @Input() disabled = false;

  aggregationForm = new FormRecord<FormControl<boolean>>({});

  /**
   * This extracts the keys with a truthy value from an object.
   * For example,
   * { France: true, England: false, 'New Zealand': null }
   * returns
   * [ 'France' ]
   */
  static extractKeys(formValues: { [key: string]: boolean | null | undefined }) {
    return (
      Object.entries(formValues)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_key, value]) => value)
        .map(([key]) => key)
    );
  }

  constructor(
    private fb: NonNullableFormBuilder,
    private translateService: TranslateService
  ) {}

  ngOnChanges(): void {
    // create as many form control as there are buckets
    const buckets = this.aggregation.buckets;
    buckets.forEach(bucket => {
      let control = this.aggregationForm.get(bucket.key) as FormControl<boolean>;
      if (!control) {
        control = this.fb.control(false);
        this.aggregationForm.addControl(bucket.key, control);
      }
      control.setValue(this.selectedKeys.includes(bucket.key));
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
