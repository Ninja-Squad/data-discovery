import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  defer,
  EMPTY,
  map,
  Observable,
  startWith,
  Subject,
  switchMap
} from 'rxjs';
import { NodeInformation, TextAccessor, TreeNode } from '../tree/tree.service';
import {
  ONTOLOGY_LANGUAGES,
  OntologyLanguage,
  OntologyPayload,
  OntologyService
} from '../../ontology.service';
import { TypedNodeDetails } from '../ontology.model';
import { Aggregation } from '../../models/page';

export interface TreeViewModel {
  filter: string;
  tree: Array<TreeNode<OntologyPayload>>;
  textAccessor: TextAccessor<OntologyPayload>;
}

@Component({
  selector: 'dd-ontology-aggregation-modal',
  templateUrl: './ontology-aggregation-modal.component.html',
  styleUrls: ['./ontology-aggregation-modal.component.scss']
})
export class OntologyAggregationModalComponent {
  treeFilterCtrl = new FormControl();
  languageCtrl: FormControl;
  languages = ONTOLOGY_LANGUAGES;
  treeView$: Observable<TreeViewModel> = EMPTY;
  private highlightedNodeSubject = new Subject<NodeInformation<OntologyPayload>>();
  highlightedNodeDetails$: Observable<TypedNodeDetails>;
  selectedNodes: Array<NodeInformation<OntologyPayload>> = [];
  maxSelectedNodes = 20;

  constructor(private modal: NgbActiveModal, private ontologyService: OntologyService) {
    this.languageCtrl = new FormControl(ontologyService.getPreferredLanguage());
    this.languageCtrl.valueChanges.subscribe(language =>
      this.ontologyService.setPreferredLanguage(language)
    );

    this.highlightedNodeDetails$ = combineLatest([
      this.languageCtrl.valueChanges.pipe(startWith(this.languageCtrl.value)),
      this.highlightedNodeSubject
    ]).pipe(
      switchMap(([language, nodeInformation]) => {
        const payload = nodeInformation.payload as OntologyPayload;
        return this.getTypedNodeDetails(payload, language);
      })
    );
  }

  prepare(aggregation: Aggregation, selectedKeys: Array<string>) {
    const tree$ = this.ontologyService.getTree({
      selectableVariableIds: aggregation.buckets.map(bucket => bucket.key),
      selectedVariableIds: selectedKeys
    });

    const textAccessor$: Observable<TextAccessor<OntologyPayload>> = defer(() =>
      this.languageCtrl.valueChanges.pipe(
        startWith(this.languageCtrl.value),
        switchMap((language: OntologyLanguage) => this.ontologyService.getTreeI18n(language)),
        map(treeI18n => (payload: OntologyPayload) => treeI18n.names[payload.type][payload.id])
      )
    );

    const filter$ = this.treeFilterCtrl.valueChanges.pipe(debounceTime(400), startWith(''));

    this.treeView$ = combineLatest([tree$, textAccessor$, filter$]).pipe(
      map(([tree, textAccessor, filter]) => ({ tree, textAccessor, filter }))
    );
  }

  private getTypedNodeDetails(
    payload: OntologyPayload,
    language: OntologyLanguage
  ): Observable<TypedNodeDetails> {
    switch (payload.type) {
      case 'ONTOLOGY':
        return this.ontologyService
          .getOntology(payload.id, language)
          .pipe(map(details => ({ type: 'ONTOLOGY', details })));
      case 'TRAIT_CLASS':
        return this.ontologyService
          .getTraitClass(payload.id, language)
          .pipe(map(details => ({ type: 'TRAIT_CLASS', details })));
      case 'TRAIT':
        return this.ontologyService
          .getTrait(payload.id, language)
          .pipe(map(details => ({ type: 'TRAIT', details })));
      case 'VARIABLE':
        return this.ontologyService
          .getVariable(payload.id, language)
          .pipe(map(details => ({ type: 'VARIABLE', details })));
    }
  }

  highlightNode(information: NodeInformation<OntologyPayload> | undefined) {
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
