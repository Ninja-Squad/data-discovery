import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Aggregation } from '../../models/page';
import { AggregationCriterion } from '../../models/aggregation-criterion';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OntologyAggregationModalComponent } from '../ontology-aggregation-modal/ontology-aggregation-modal.component';

@Component({
  selector: 'dd-ontology-aggregation',
  templateUrl: './faidare-ontology-aggregation.component.html',
  styleUrls: ['./faidare-ontology-aggregation.component.scss']
})
export class FaidareOntologyAggregationComponent {
  @Input() aggregation!: Aggregation;
  @Input() selectedKeys: Array<string> = [];
  @Output() aggregationChange = new EventEmitter<AggregationCriterion>();

  constructor(private modalService: NgbModal) {}

  openModal() {
    const modal = this.modalService.open(OntologyAggregationModalComponent, { size: 'xl' });
    (modal.componentInstance as OntologyAggregationModalComponent).prepare(
      this.aggregation,
      this.selectedKeys
    );
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
