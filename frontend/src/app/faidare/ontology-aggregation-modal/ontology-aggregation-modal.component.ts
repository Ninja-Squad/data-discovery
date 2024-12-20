import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Signal,
  signal
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  defer,
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
import { TranslateModule } from '@ngx-translate/core';
import { OntologyNodeTypeComponent } from '../ontology-node-type/ontology-node-type.component';
import { DecimalPipe } from '@angular/common';
import { TreeComponent } from '../tree/tree.component';
import { NodeDetailsComponent } from '../node-details/node-details.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

interface TreeViewModel {
  filter: string;
  tree: Array<TreeNode<OntologyPayload>>;
  textAccessor: TextAccessor<OntologyPayload>;
}

@Component({
  selector: 'dd-ontology-aggregation-modal',
  templateUrl: './ontology-aggregation-modal.component.html',
  styleUrl: './ontology-aggregation-modal.component.scss',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    TranslateModule,
    OntologyNodeTypeComponent,
    TreeComponent,
    NodeDetailsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OntologyAggregationModalComponent {
  private modal = inject(NgbActiveModal);
  private ontologyService = inject(OntologyService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(NonNullableFormBuilder);

  readonly treeFilterCtrl = this.fb.control('');
  readonly languageCtrl = this.fb.control<OntologyLanguage>('FR');
  readonly languages = ONTOLOGY_LANGUAGES;
  readonly treeView = signal<TreeViewModel | undefined>(undefined);
  private highlightedNodeSubject = new Subject<NodeInformation<OntologyPayload>>();
  readonly highlightedNodeDetails: Signal<TypedNodeDetails | undefined>;
  readonly selectedNodes = signal<Array<NodeInformation<OntologyPayload>>>([]);
  maxSelectedNodes = 20;

  constructor() {
    this.languageCtrl.setValue(this.ontologyService.getPreferredLanguage());
    this.languageCtrl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(language => this.ontologyService.setPreferredLanguage(language));

    this.highlightedNodeDetails = toSignal(
      combineLatest([
        this.languageCtrl.valueChanges.pipe(startWith(this.languageCtrl.value)),
        this.highlightedNodeSubject
      ]).pipe(
        switchMap(([language, nodeInformation]) => {
          const payload = nodeInformation.payload as OntologyPayload;
          return this.getTypedNodeDetails(payload, language);
        })
      )
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

    combineLatest([tree$, textAccessor$, filter$])
      .pipe(
        map(([tree, textAccessor, filter]) => ({ tree, textAccessor, filter })),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(treeView => this.treeView.set(treeView));
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
      this.selectedNodes().map(nodeInformation => (nodeInformation.payload as OntologyPayload).id)
    );
  }

  cancel() {
    this.modal.dismiss();
  }
}
