import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Aggregation } from '../models/page';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { Observable } from 'rxjs/internal/Observable';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

const maxResultsDisplayed = 10;

@Component({
  selector: 'rare-large-aggregation',
  templateUrl: './large-aggregation.component.html',
  styleUrls: ['./large-aggregation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LargeAggregationComponent {

  @Input() aggregation: Aggregation;
  @Input() selectedKeys: Array<string> = [];
  // the component emits an event if the user adds or remove a criterion
  @Output() aggregationChange = new EventEmitter<AggregationCriterion>();

  criterion = new FormControl('');

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term =>
        this.aggregation.buckets
        // returns values not already selected
          .filter(bucket => !this.selectedKeys.includes(bucket.key)
            // and that contains the term, ignoring the case
            && bucket.key.toLowerCase().includes(term.toLowerCase()))
          // returns the first 10 results
          .slice(0, maxResultsDisplayed))
    )

  emitEvent(): void {

    // to emit a new event every time a value changes
    const event: AggregationCriterion = {
      name: this.aggregation.name,
      values: this.selectedKeys
    };
    this.aggregationChange.emit(event);
  }

  removeKey(key: string) {
    const index = this.selectedKeys.indexOf(key);
    this.selectedKeys = [...this.selectedKeys.slice(0, index), ...this.selectedKeys.slice(index + 1)];
    this.emitEvent();
  }

  selectKey(event: NgbTypeaheadSelectItemEvent) {
    event.preventDefault();
    // the item field of the event contains the bucket
    // we push the selected key to our collection of keys
    this.selectedKeys = [...this.selectedKeys, event.item.key];
    this.criterion.setValue('');
    this.emitEvent();
  }

  documentCountForKey(key: string) {
    return this.aggregation.buckets.find(bucket => bucket.key === key).documentCount;
  }
}
