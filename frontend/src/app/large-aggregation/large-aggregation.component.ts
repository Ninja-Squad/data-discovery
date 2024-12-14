import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, output, inject, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, map, merge, Observable, Subject } from 'rxjs';
import {
  NgbHighlight,
  NgbTooltip,
  NgbTypeahead,
  NgbTypeaheadSelectItemEvent
} from '@ng-bootstrap/ng-bootstrap';
import { NULL_VALUE, NULL_VALUE_TRANSLATION_KEY } from '../models/document.model';

import { Aggregation, Bucket } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AggregationNamePipe } from '../aggregation-name.pipe';
import { DescendantsCheckboxComponent } from '../descendants-checkbox/descendants-checkbox.component';
import { DocumentCountComponent } from '../document-count/document-count.component';
import { DecimalPipe, NgPlural, NgPluralCase } from '@angular/common';

export type BucketOrRefine = Bucket | 'REFINE';

const maxResultsDisplayed = 8;

@Component({
    selector: 'dd-large-aggregation',
    templateUrl: './large-aggregation.component.html',
    styleUrl: './large-aggregation.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgPlural,
        NgPluralCase,
        DecimalPipe,
        ReactiveFormsModule,
        TranslateModule,
        NgbHighlight,
        NgbTooltip,
        NgbTypeahead,
        DocumentCountComponent,
        DescendantsCheckboxComponent,
        AggregationNamePipe
    ]
})
export class LargeAggregationComponent implements OnChanges {
  private translateService = inject(TranslateService);

  @Input() selectedKeys: Array<string> = [];

  @Input() aggregation!: Aggregation;
  // the component emits an event if the user adds or removes a criterion
  readonly aggregationChange = output<AggregationCriterion>();

  @Input() searchDescendants = false;
  readonly searchDescendantsChange = output<boolean>();

  @Input() disabled = false;

  readonly typeahead = viewChild<ElementRef<HTMLInputElement>>('typeahead');

  focus$ = new Subject<string>();
  criterion = new FormControl('');

  search = (text$: Observable<string>): Observable<Array<BucketOrRefine>> => {
    const inputFocus$ = this.focus$;
    return merge(text$, inputFocus$).pipe(
      distinctUntilChanged(),
      map(term => {
        const allMatchingBuckets = this.aggregation.buckets
          // returns values not already selected
          .filter(
            bucket =>
              !this.selectedKeys.includes(bucket.key) &&
              // and that contains the term, ignoring the case
              this.displayableKey(bucket.key).toLowerCase().includes(term.toString().toLowerCase())
          );

        // return the first N results
        const result: Array<BucketOrRefine> = allMatchingBuckets.slice(0, maxResultsDisplayed);

        // if more results exist, add a fake refine bucket
        if (allMatchingBuckets.length > maxResultsDisplayed) {
          result.push('REFINE');
        }

        return result;
      })
    );
  };

  ngOnChanges() {
    if (this.disabled) {
      this.criterion.disable({ emitEvent: false });
    } else {
      this.criterion.enable({ emitEvent: false });
    }
  }

  onSearchDescendants(event: boolean) {
    this.searchDescendants = event;
    this.searchDescendantsChange.emit(event);
  }

  removeKey(key: string) {
    const newSelectedKeys = this.selectedKeys.filter(k => k !== key);
    this.selectedKeys = newSelectedKeys;

    this.aggregationChange.emit({
      name: this.aggregation.name,
      values: newSelectedKeys
    });
  }

  selectKey(event: NgbTypeaheadSelectItemEvent) {
    event.preventDefault();
    const selected: BucketOrRefine = event.item;
    if (selected !== 'REFINE') {
      // the item field of the event contains the bucket
      // we push the selected key to our collection of keys
      const newSelectedKeys = [...this.selectedKeys, event.item.key];
      this.selectedKeys = newSelectedKeys;
      this.criterion.setValue('');
      this.aggregationChange.emit({
        name: this.aggregation.name,
        values: newSelectedKeys
      });
    }
    this.typeahead()!.nativeElement.focus();
  }

  documentCountForKey(key: string) {
    return this.aggregation.buckets.find(bucket => bucket.key === key)?.documentCount ?? 0;
  }

  displayableKey(key: string): string {
    return key === NULL_VALUE ? this.translateService.instant(NULL_VALUE_TRANSLATION_KEY) : key;
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
