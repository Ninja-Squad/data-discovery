import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TreeNode } from './faidare/tree/tree.service';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export type OntologyNodeType = 'ONTOLOGY' | 'TRAIT_CLASS' | 'TRAIT' | 'VARIABLE';

export interface OntologyPayload {
  id: string;
  name: string;
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
  };
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
  };
}

@Injectable({
  providedIn: 'root'
})
export class OntologyService {
  private tree$: Observable<Array<OntologyTreeNode>>;

  constructor(private http: HttpClient) {
    this.tree$ = http.get<Array<OntologyTreeNode>>('api/ontologies').pipe(shareReplay());
  }

  getTree(
    selectableVariableIds: Array<string>,
    selectedVariableIds: Array<string>
  ): Observable<Array<TreeNode>> {
    return this.tree$.pipe(
      map(ontologyTreeNodes =>
        this.toTreeNodes(
          ontologyTreeNodes,
          new Set<string>(selectableVariableIds),
          new Set<string>(selectedVariableIds)
        )
      )
    );
  }

  getOntology(id: string): Observable<OntologyDetails> {
    return this.http.get<OntologyDetails>(`api/ontologies/${id}`);
  }

  getTraitClass(id: string): Observable<TraitClassDetails> {
    return this.http.get<TraitClassDetails>(`api/ontologies/trait-classes/${id}`);
  }

  getTrait(id: string): Observable<TraitDetails> {
    return this.http.get<TraitDetails>(`api/ontologies/traits/${id}`);
  }

  getVariable(id: string): Observable<VariableDetails> {
    return this.http.get<VariableDetails>(`api/ontologies/variables/${id}`);
  }

  private toTreeNodes(
    ontologyTreeNodes: Array<OntologyTreeNode>,
    selectableVariableIds: Set<string>,
    selectedVariableIds: Set<string>
  ): Array<TreeNode> {
    const result: Array<TreeNode> = [];
    for (let i = 0; i < ontologyTreeNodes.length; i++) {
      const treeNode = this.toTreeNode(
        ontologyTreeNodes[i],
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
  ): TreeNode | null {
    if (ontologyTreeNode.payload.type === 'VARIABLE') {
      // FIXME JBN remove || true which is there only to be able to test the tree while the aggregation doesn't work
      if (selectableVariableIds.has(ontologyTreeNode.payload.id) || true) {
        return {
          text: ontologyTreeNode.payload.name,
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
          text: ontologyTreeNode.payload.name,
          payload: ontologyTreeNode.payload,
          children
        };
      } else {
        return null;
      }
    }
  }
}
