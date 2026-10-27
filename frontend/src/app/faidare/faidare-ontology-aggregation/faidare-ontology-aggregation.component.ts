import { DecimalPipe, NgPlural, NgPluralCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NgbModal, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TranslateDirective } from '@ngx-translate/core';
import { AggregationCriterion } from '../../models/aggregation-criterion';
import { NULL_VALUE } from '../../models/document.model';
import { Aggregation } from '../../models/page';
import { OntologyAggregationModalComponent } from '../ontology-aggregation-modal/ontology-aggregation-modal.component';

@Component({
  selector: 'dd-ontology-aggregation',
  templateUrl: './faidare-ontology-aggregation.component.html',
  styleUrl: './faidare-ontology-aggregation.component.scss',
  imports: [NgPlural, NgPluralCase, DecimalPipe, TranslateDirective, NgbTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareOntologyAggregationComponent {
  private readonly modalService = inject(NgbModal);

  readonly aggregation = input.required<Aggregation>();
  readonly selectedKeys = input<Array<string>>([]);
  readonly aggregationChange = output<AggregationCriterion>();
  readonly disabled = input(false);

  /**
   * The actual bucket length, which is the bucket length minus one if one of the bucket keys is the null value,
   * that is not selectable for this aggregation type
   */
  readonly actualBucketLength = computed(() => {
    let result = this.aggregation().buckets.length;
    if (this.aggregation().buckets.some(bucket => bucket.key === NULL_VALUE)) {
      result -= 1;
    }
    return result;
  });

  openModal() {
    const modal = this.modalService.open(OntologyAggregationModalComponent, { size: 'xl' });
    modal.componentInstance.prepare(this.aggregation(), this.selectedKeys());
    modal.result.then(
      (selectedVariableIds: Array<string>) => {
        const event: AggregationCriterion = {
          name: this.aggregation().name,
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
