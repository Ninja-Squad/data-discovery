import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  Resource,
  resourceFromSnapshots,
  ResourceSnapshot,
  signal
} from '@angular/core';
import { OntologyNodeTypeComponent } from '../ontology-node-type/ontology-node-type.component';
import { debounce, form, FormField } from '@angular/forms/signals';
import { TreeComponent } from '../tree/tree.component';
import { NodeDetailsComponent } from '../node-details/node-details.component';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import {
  ONTOLOGY_LANGUAGES,
  OntologyLanguage,
  OntologyPayload,
  OntologyService
} from '../../ontology.service';
import { map, Observable } from 'rxjs';
import { NodeInformation, PayloadPredicate, TextAccessor, TreeNode } from '../tree/tree.service';
import { TypedNodeDetails } from '../ontology.model';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

interface TreeViewModel {
  filter: string;
  tree: Array<TreeNode<OntologyPayload>>;
  textAccessor: TextAccessor<OntologyPayload>;
  highlightedNodePredicate: PayloadPredicate<OntologyPayload> | undefined;
}

/** Keeps stale language data while replacements load so the tree preserves expansion and highlight state. */
function withPreviousValue<T>(input: Resource<T>): Resource<T> {
  const snapshots = linkedSignal<ResourceSnapshot<T>, ResourceSnapshot<T>>({
    source: () => input.snapshot(),
    computation: (snapshot, previous) => {
      if (snapshot.status === 'loading' && previous?.value.status === 'resolved') {
        return { status: 'loading', value: previous.value.value };
      }
      return snapshot;
    }
  });
  return resourceFromSnapshots(snapshots);
}

@Component({
  selector: 'dd-faidare-ontology',
  imports: [
    OntologyNodeTypeComponent,
    FormField,
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
  private readonly router = inject(Router);
  private readonly highlightedNodeId = inject(ActivatedRoute).snapshot.fragment ?? undefined;
  private readonly highlightedNodePredicate: PayloadPredicate<OntologyPayload> | undefined = this
    .highlightedNodeId
    ? payload => payload.id === this.highlightedNodeId
    : undefined;

  private readonly filterFormValue = signal({
    treeFilter: '',
    language: this.ontologyService.getPreferredLanguage()
  });
  readonly filterForm = form(this.filterFormValue, path => {
    debounce(path.treeFilter, 400);
  });
  readonly languages = ONTOLOGY_LANGUAGES;
  private readonly tree = toSignal(this.ontologyService.getCompleteTree());
  private readonly treeI18n = withPreviousValue(
    rxResource({
      params: () => this.filterFormValue().language,
      stream: ({ params: language }) => this.ontologyService.getTreeI18n(language)
    })
  );
  private readonly textAccessor = computed<TextAccessor<OntologyPayload> | undefined>(() => {
    if (!this.treeI18n.hasValue()) {
      return undefined;
    }
    const treeI18n = this.treeI18n.value();
    return payload => treeI18n.names[payload.type][payload.id];
  });
  readonly treeView = computed<TreeViewModel | undefined>(() => {
    const tree = this.tree();
    const textAccessor = this.textAccessor();
    if (!tree || !textAccessor) {
      return undefined;
    }
    return {
      filter: this.filterFormValue().treeFilter,
      tree,
      textAccessor,
      highlightedNodePredicate: this.highlightedNodePredicate
    };
  });

  private readonly highlightedNode = signal<NodeInformation<OntologyPayload> | undefined>(
    undefined
  );
  private readonly highlightedNodeDetailsResource = withPreviousValue(
    rxResource({
      params: () => {
        const highlightedNode = this.highlightedNode();
        return highlightedNode
          ? { payload: highlightedNode.payload, language: this.filterFormValue().language }
          : undefined;
      },
      stream: ({ params }) => this.getTypedNodeDetails(params.payload, params.language)
    })
  );
  readonly highlightedNodeDetails = computed(() =>
    this.highlightedNodeDetailsResource.hasValue()
      ? this.highlightedNodeDetailsResource.value()
      : undefined
  );

  languageChanged() {
    this.ontologyService.setPreferredLanguage(this.filterFormValue().language);
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
      this.highlightedNode.set(information);
      this.router.navigate([], { fragment: information.payload.id });
    }
  }
}
