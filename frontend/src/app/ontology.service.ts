import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TreeNode } from './faidare/tree/tree.service';
import { map, Observable, shareReplay } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export type OntologyNodeType = 'ONTOLOGY' | 'TRAIT_CLASS' | 'TRAIT' | 'VARIABLE';

export interface OntologyPayload {
  id: string;
  type: OntologyNodeType;
}

interface OntologyTreeNode {
  payload: OntologyPayload;
  children?: Array<OntologyTreeNode>;
}

export interface OntologyDetails {
  ontologyDbId: string;
  ontologyName: string;
  version: string;
  authors: string;
  links: Array<{ href: string; rel: string }>;
  copyright: string;
  license: string;
}

export interface TraitClassDetails {
  name: string;
  ontologyName: string;
}

export interface TraitDetails {
  name: string;
  ontologyName: string;
  traitDbId: string;
  description: string;
  entity: string;
  attribute: string;
  class: string;
  synonyms: Array<string>;
  mainAbbreviation: string;
  alternativeAbbreviations: Array<string>;
  status: string;
  xref: string;
}

export interface VariableDetails {
  name: string;
  ontologyName: string;
  observationVariableDbId: string;
  synonyms: Array<string>;
  institution: string;
  scientist: string;
  date: string;
  crop: string;
  documentationURL: string;
  contextOfUse: Array<string>;
  growthStage: string;
  status: string;
  xref: string;
  defaultValue: string;
  trait: {
    name: string;
    traitDbId: string;
    description: string;
    entity: string;
    attribute: string;
    class: string;
    synonyms: Array<string>;
    mainAbbreviation: string;
    alternativeAbbreviations: Array<string>;
    status: string;
    xref: string;
  };
  method: {
    name: string;
    class: string;
    description: string;
    formula: string;
    methodDbId: string;
    reference: string;
  } | null;
  scale: {
    name: string;
    dataType: string;
    decimalPlaces: string;
    scaleDbId: string;
    validValues: {
      categories: Array<string>;
      max: number;
      min: number;
    };
    xref: string;
  } | null;
}

export interface TreeI18n {
  language: string;
  names: Record<OntologyNodeType, Record<string, string>>;
}

export const ONTOLOGY_LANGUAGES = ['EN', 'FR', 'ES'] as const;
export type OntologyLanguage = (typeof ONTOLOGY_LANGUAGES)[number];

@Injectable({
  providedIn: 'root'
})
export class OntologyService {
  private http = inject(HttpClient);

  private tree$: Observable<Array<OntologyTreeNode>>;
  private treeI18ns: Map<OntologyLanguage, Observable<TreeI18n>>;
  private preferredLanguage: OntologyLanguage;

  constructor() {
    const translateService = inject(TranslateService);

    this.tree$ = this.http.get<Array<OntologyTreeNode>>('api/ontologies').pipe(shareReplay());
    this.treeI18ns = new Map<OntologyLanguage, Observable<TreeI18n>>(
      ONTOLOGY_LANGUAGES.map(language => [
        language,
        this.http.get<TreeI18n>('api/ontologies/i18n', { params: { language } }).pipe(shareReplay())
      ])
    );
    this.preferredLanguage = translateService.instant('faidare.ontology-default-language');
    if (!ONTOLOGY_LANGUAGES.includes(this.preferredLanguage)) {
      this.preferredLanguage = 'EN';
    }
  }

  getPreferredLanguage(): OntologyLanguage {
    return this.preferredLanguage;
  }

  setPreferredLanguage(language: OntologyLanguage): void {
    this.preferredLanguage = language;
  }

  getTree(options: {
    selectableVariableIds: Array<string>;
    selectedVariableIds: Array<string>;
  }): Observable<Array<TreeNode<OntologyPayload>>> {
    return this.tree$.pipe(
      map(ontologyTreeNodes =>
        this.toTreeNodes(
          ontologyTreeNodes,
          new Set<string>(options.selectableVariableIds),
          new Set<string>(options.selectedVariableIds)
        )
      )
    );
  }

  getTreeI18n(language: OntologyLanguage): Observable<TreeI18n> {
    return this.treeI18ns.get(language)!;
  }

  getOntology(id: string, language: OntologyLanguage): Observable<OntologyDetails> {
    return this.http.get<OntologyDetails>(`api/ontologies/${id}`, { params: { language } });
  }

  getTraitClass(id: string, language: OntologyLanguage): Observable<TraitClassDetails> {
    return this.http.get<TraitClassDetails>(`api/ontologies/trait-classes/${id}`, {
      params: { language }
    });
  }

  getTrait(id: string, language: OntologyLanguage): Observable<TraitDetails> {
    return this.http.get<TraitDetails>(`api/ontologies/traits/${id}`, { params: { language } });
  }

  getVariable(id: string, language: OntologyLanguage): Observable<VariableDetails> {
    return this.http.get<VariableDetails>(`api/ontologies/variables/${id}`, {
      params: { language }
    });
  }

  private toTreeNodes(
    ontologyTreeNodes: Array<OntologyTreeNode>,
    selectableVariableIds: Set<string>,
    selectedVariableIds: Set<string>
  ): Array<TreeNode<OntologyPayload>> {
    const result: Array<TreeNode<OntologyPayload>> = [];
    for (const ontologyTreeNode of ontologyTreeNodes) {
      const treeNode = this.toTreeNode(
        ontologyTreeNode,
        selectableVariableIds,
        selectedVariableIds
      );
      if (treeNode) {
        result.push(treeNode);
      }
    }
    return result;
  }

  private toTreeNode(
    ontologyTreeNode: OntologyTreeNode,
    selectableVariableIds: Set<string>,
    selectedVariableIds: Set<string>
  ): TreeNode<OntologyPayload> | null {
    if (ontologyTreeNode.payload.type === 'VARIABLE') {
      if (selectableVariableIds.has(ontologyTreeNode.payload.id)) {
        return {
          payload: ontologyTreeNode.payload,
          children: [],
          selected: selectedVariableIds.has(ontologyTreeNode.payload.id)
        };
      } else {
        return null;
      }
    } else {
      const children = this.toTreeNodes(
        ontologyTreeNode.children ?? [],
        selectableVariableIds,
        selectedVariableIds
      );
      if (children.length) {
        return {
          payload: ontologyTreeNode.payload,
          children
        };
      } else {
        return null;
      }
    }
  }
}
