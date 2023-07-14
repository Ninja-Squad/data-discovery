import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { Aggregation } from '../../models/page';
import { AggregationCriterion } from '../../models/aggregation-criterion';
import { NgbModal, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { OntologyAggregationModalComponent } from '../ontology-aggregation-modal/ontology-aggregation-modal.component';
import { NULL_VALUE } from '../../models/document.model';
import { DecimalPipe, NgIf, NgPlural, NgPluralCase } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dd-ontology-aggregation',
  templateUrl: './faidare-ontology-aggregation.component.html',
  styleUrls: ['./faidare-ontology-aggregation.component.scss'],
  standalone: true,
  imports: [NgIf, NgPlural, NgPluralCase, DecimalPipe, TranslateModule, NgbTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareOntologyAggregationComponent implements OnChanges {
  @Input() aggregation!: Aggregation;
  @Input() selectedKeys: Array<string> = [];
  @Output() aggregationChange = new EventEmitter<AggregationCriterion>();
  @Input() disabled = false;

  /**
   * The actual bucket length, which is the bucket length minus one if one of the bucket keys is the null value,
   * that is not selectable for this aggregation type
   */
  actualBucketLength = 0;

  constructor(private modalService: NgbModal) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.aggregation) {
      this.actualBucketLength = this.aggregation.buckets.length;
      if (this.aggregation.buckets.some(bucket => bucket.key === NULL_VALUE)) {
        this.actualBucketLength -= 1;
      }
    }
  }

  openModal() {
    const modal = this.modalService.open(OntologyAggregationModalComponent, { size: 'xl' });
    modal.componentInstance.prepare(this.aggregation, this.selectedKeys);
    modal.result.then(
      (selectedVariableIds: Array<string>) => {
        const event: AggregationCriterion = {
          name: this.aggregation.name,
          values: selectedVariableIds
        };
        this.aggregationChange.emit(event);
      },
      () => {
        // nothing to do when dismissed
      }
    );
  }
}
