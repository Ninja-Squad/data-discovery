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
  ontologyName: string;
  // TODO add properties
}

export interface TraitClassDetails {
  name: string;
  // TODO add properties
}

export interface TraitDetails {
  name: string;
  // TODO add properties
}

export interface VariableDetails {
  name: string;
  // TODO add properties
}

@Injectable({
  providedIn: 'root'
})
export class OntologyService {
  private tree$: Observable<Array<TreeNode>>;

  constructor(private http: HttpClient) {
    this.tree$ = http.get<Array<OntologyTreeNode>>('api/ontologies').pipe(
      // whareReplay is placed before the map because we want each observer to get its tree, in case it modifies it.
      shareReplay(),
      map(ontologyTreeNodes => this.toTreeNodes(ontologyTreeNodes))
    );
  }

  getTree(): Observable<Array<TreeNode>> {
    return this.tree$;
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

  private toTreeNodes(ontologyTreeNodes: Array<OntologyTreeNode>): Array<TreeNode> {
    return ontologyTreeNodes.map(ontologyTreeNode => this.toTreeNode(ontologyTreeNode));
  }

  private toTreeNode(ontologyTreeNode: OntologyTreeNode): TreeNode {
    return {
      text: ontologyTreeNode.payload.name ?? '??',
      payload: ontologyTreeNode.payload,
      children: ontologyTreeNode.children ? this.toTreeNodes(ontologyTreeNode.children) : []
    };
  }
}
