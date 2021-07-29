import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { NULL_VALUE, NULL_VALUE_TRANSLATION_KEY } from '../models/document.model';

import { Aggregation, Bucket } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { TranslateService } from '@ngx-translate/core';

export type BucketOrRefine = Bucket | 'REFINE';

const maxResultsDisplayed = 8;

@Component({
  selector: 'dd-large-aggregation',
  templateUrl: './large-aggregation.component.html',
  styleUrls: ['./large-aggregation.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class LargeAggregationComponent {
  @Input() aggregation!: Aggregation;
  @Input() selectedKeys: Array<string> = [];
  // the component emits an event if the user adds or removes a criterion
  @Output() aggregationChange = new EventEmitter<AggregationCriterion>();
  @Output() searchDescendantsChange = new EventEmitter<boolean>();

  @ViewChild('typeahead') typeahead!: ElementRef<HTMLInputElement>;

  focus$ = new Subject<string>();
  criterion = new FormControl('');
  @Input() searchDescendants = false;

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

  constructor(private translateService: TranslateService) {}

  emitEvent(): void {
    // to emit a new event every time a value changes
    const event: AggregationCriterion = {
      name: this.aggregation.name,
      values: this.selectedKeys
    };
    this.aggregationChange.emit(event);
  }

  onSearchDescendants(event: boolean) {
    this.searchDescendants = event;
    this.searchDescendantsChange.emit(event);
  }

  removeKey(key: string) {
    const index = this.selectedKeys.indexOf(key);
    this.selectedKeys = [
      ...this.selectedKeys.slice(0, index),
      ...this.selectedKeys.slice(index + 1)
    ];
    this.emitEvent();
  }

  selectKey(event: NgbTypeaheadSelectItemEvent) {
    event.preventDefault();
    const selected: BucketOrRefine = event.item;
    if (selected !== 'REFINE') {
      // the item field of the event contains the bucket
      // we push the selected key to our collection of keys
      this.selectedKeys = [...this.selectedKeys, event.item.key];
      this.criterion.setValue('');
      this.emitEvent();
    }
    this.typeahead.nativeElement.focus();
  }

  documentCountForKey(key: string) {
    return this.aggregation.buckets.find(bucket => bucket.key === key)!.documentCount;
  }

  displayableKey(key: string): string {
    return key === NULL_VALUE ? this.translateService.instant(NULL_VALUE_TRANSLATION_KEY) : key;
  }
}
