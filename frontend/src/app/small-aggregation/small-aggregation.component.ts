import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  OnChanges,
  output
} from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';

import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { NULL_VALUE, NULL_VALUE_TRANSLATION_KEY } from '../models/document.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AggregationNamePipe } from '../aggregation-name.pipe';
import { DescendantsCheckboxComponent } from '../descendants-checkbox/descendants-checkbox.component';
import { DocumentCountComponent } from '../document-count/document-count.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'dd-small-aggregation',
  templateUrl: './small-aggregation.component.html',
  styleUrl: './small-aggregation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgbTooltip,
    ReactiveFormsModule,
    DocumentCountComponent,
    DescendantsCheckboxComponent,
    TranslatePipe,
    AggregationNamePipe
  ]
})
export class SmallAggregationComponent implements OnChanges {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly translateService = inject(TranslateService);

  readonly aggregation = input.required<Aggregation>();
  readonly searchDescendants = model(false);
  readonly selectedKeys = input<Array<string>>([]);
  // the component emits an event if the user adds or remove a criterion
  readonly aggregationChange = output<AggregationCriterion>();
  readonly disabled = input(false);

  readonly aggregationForm = this.fb.record<FormControl<boolean>>({});

  /**
   * This extracts the keys with a truthy value from an object.
   * For example,
   * { France: true, England: false, 'New Zealand': null }
   * returns
   * [ 'France' ]
   */
  static extractKeys(formValues: Record<string, boolean | null | undefined>) {
    return Object.entries(formValues)
      .filter(([_key, value]) => value)
      .map(([key]) => key);
  }

  ngOnChanges(): void {
    // create as many form control as there are buckets
    const buckets = this.aggregation().buckets;
    buckets.forEach(bucket => {
      let control = this.aggregationForm.get(bucket.key) as FormControl<boolean>;
      if (!control) {
        control = this.fb.control(false);
        this.aggregationForm.addControl(bucket.key, control);
      }
      control.setValue(this.selectedKeys().includes(bucket.key));
    });
    Object.keys(this.aggregationForm.controls).forEach(key => {
      if (!buckets.find(bucket => bucket.key === key)) {
        this.aggregationForm.removeControl(key);
      }
    });

    if (this.disabled() || this.aggregation().buckets.length <= 1) {
      this.aggregationForm.disable();
    } else {
      this.aggregationForm.enable();
    }
  }

  displayableKey(key: string): string {
    return key === NULL_VALUE ? this.translateService.instant(NULL_VALUE_TRANSLATION_KEY) : key;
  }

  onSearchDescendants(event: boolean) {
    this.searchDescendants.set(event);
  }

  onChange() {
    const values = SmallAggregationComponent.extractKeys(this.aggregationForm.value);
    const event: AggregationCriterion = {
      name: this.aggregation().name,
      values
    };
    this.aggregationChange.emit(event);
  }

  /**
   * The aggregation is hidden if there are no buckets or if the only bucket is the NULL_VALUE bucket
   */
  get hideAggregation() {
    const aggregation = this.aggregation();
    return (
      aggregation.buckets.length === 0 ||
      (aggregation.buckets.length === 1 && aggregation.buckets[0].key === NULL_VALUE)
    );
  }
}
