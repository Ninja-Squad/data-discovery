import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { EMPTY, Observable, Subject } from 'rxjs';
import { NodeInformation, TreeNode } from '../tree/tree.service';
import { OntologyPayload, OntologyService } from '../../ontology.service';
import { TypedNodeDetails } from '../ontology.model';
import { Aggregation } from '../../models/page';

@Component({
  selector: 'dd-ontology-aggregation-modal',
  templateUrl: './ontology-aggregation-modal.component.html',
  styleUrls: ['./ontology-aggregation-modal.component.scss']
})
export class OntologyAggregationModalComponent {
  treeFilterCtrl = new FormControl();
  debouncedFilterValue$ = this.treeFilterCtrl.valueChanges.pipe(debounceTime(400));
  tree$: Observable<Array<TreeNode>>;
  private highlightedNodeSubject = new Subject<NodeInformation>();
  highlightedNodeDetails$: Observable<TypedNodeDetails>;
  selectedNodes: Array<NodeInformation> = [];

  constructor(private modal: NgbActiveModal, private ontologyService: OntologyService) {
    this.tree$ = EMPTY;
    this.highlightedNodeDetails$ = this.highlightedNodeSubject.pipe(
      switchMap(nodeInformation => {
        const payload = nodeInformation.payload as OntologyPayload;
        return this.getTypedNodeDetails(payload);
      })
    );
  }

  prepare(aggregation: Aggregation, selectedKeys: Array<string>) {
    this.tree$ = this.ontologyService.getTree(
      aggregation.buckets.map(bucket => bucket.key),
      selectedKeys
    );
  }

  private getTypedNodeDetails(payload: OntologyPayload): Observable<TypedNodeDetails> {
    switch (payload.type) {
      case 'ONTOLOGY':
        return this.ontologyService
          .getOntology(payload.id)
          .pipe(map(details => ({ type: 'ONTOLOGY', details })));
      case 'TRAIT_CLASS':
        return this.ontologyService
          .getTraitClass(payload.id)
          .pipe(map(details => ({ type: 'TRAIT_CLASS', details })));
      case 'TRAIT':
        return this.ontologyService
          .getTrait(payload.id)
          .pipe(map(details => ({ type: 'TRAIT', details })));
      case 'VARIABLE':
        return this.ontologyService
          .getVariable(payload.id)
          .pipe(map(details => ({ type: 'VARIABLE', details })));
    }
  }

  highlightNode(information: NodeInformation | undefined) {
    if (information) {
      this.highlightedNodeSubject.next(information);
    }
  }

  ok() {
    this.modal.close(
      this.selectedNodes.map(nodeInformation => (nodeInformation.payload as OntologyPayload).id)
    );
  }

  cancel() {
    this.modal.dismiss();
  }
}
