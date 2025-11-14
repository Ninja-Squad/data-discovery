import { ChangeDetectionStrategy, Component, DestroyRef, inject, Signal } from '@angular/core';
import { OntologyNodeTypeComponent } from '../ontology-node-type/ontology-node-type.component';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TreeComponent } from '../tree/tree.component';
import { NodeDetailsComponent } from '../node-details/node-details.component';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import {
  ONTOLOGY_LANGUAGES,
  OntologyLanguage,
  OntologyPayload,
  OntologyService
} from '../../ontology.service';
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
import { NodeInformation, PayloadPredicate, TextAccessor, TreeNode } from '../tree/tree.service';
import { TypedNodeDetails } from '../ontology.model';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

interface TreeViewModel {
  filter: string;
  tree: Array<TreeNode<OntologyPayload>>;
  textAccessor: TextAccessor<OntologyPayload>;
  highlightedNodePredicate: PayloadPredicate<OntologyPayload> | undefined;
}

@Component({
  selector: 'dd-faidare-ontology',
  imports: [
    OntologyNodeTypeComponent,
    ReactiveFormsModule,
    TreeComponent,
    NodeDetailsComponent,
    TranslateDirective,
    TranslatePipe
  ],
  templateUrl: './faidare-ontology.component.html',
  styleUrl: './faidare-ontology.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareOntologyComponent {
  private readonly ontologyService = inject(OntologyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  readonly treeFilterCtrl = this.fb.control('');
  readonly languageCtrl = this.fb.control<OntologyLanguage>('FR');
  readonly languages = ONTOLOGY_LANGUAGES;
  readonly treeView: Signal<TreeViewModel | undefined>;
  private readonly highlightedNodeSubject = new Subject<NodeInformation<OntologyPayload>>();
  readonly highlightedNodeDetails: Signal<TypedNodeDetails | undefined>;

  constructor() {
    const highlightedNodeId = inject(ActivatedRoute).snapshot.fragment ?? undefined;
    const highlightedNodePredicate: PayloadPredicate<OntologyPayload> | undefined =
      highlightedNodeId ? payload => payload.id === highlightedNodeId : undefined;
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
          const payload = nodeInformation.payload;
          return this.getTypedNodeDetails(payload, language);
        })
      )
    );

    const tree$ = this.ontologyService.getCompleteTree();

    const textAccessor$: Observable<TextAccessor<OntologyPayload>> = defer(() =>
      this.languageCtrl.valueChanges.pipe(
        startWith(this.languageCtrl.value),
        switchMap((language: OntologyLanguage) => this.ontologyService.getTreeI18n(language)),
        map(treeI18n => (payload: OntologyPayload) => treeI18n.names[payload.type][payload.id])
      )
    );

    const filter$ = this.treeFilterCtrl.valueChanges.pipe(debounceTime(400), startWith(''));

    this.treeView = toSignal(
      combineLatest([tree$, textAccessor$, filter$]).pipe(
        map(([tree, textAccessor, filter]) => ({
          tree,
          textAccessor,
          filter,
          highlightedNodePredicate
        })),
        takeUntilDestroyed(this.destroyRef)
      )
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
      this.router.navigate([], { fragment: information.payload.id });
    }
  }
}
