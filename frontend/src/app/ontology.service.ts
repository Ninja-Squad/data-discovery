import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TreeNode } from './faidare/tree/tree.service';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export type OntologyNodeType = 'ONTOLOGY' | 'TRAIT_CLASS' | 'TRAIT_NAME' | 'VARIABLE';

export interface OntologyPayload {
  name: string;
  type: OntologyNodeType;
}

interface OntologyTreeNode {
  payload: OntologyPayload;
  children?: Array<OntologyTreeNode>;
}

@Injectable({
  providedIn: 'root'
})
export class OntologyService {
  private tree$: Observable<Array<TreeNode>>;

  constructor(http: HttpClient) {
    this.tree$ = http.get<Array<OntologyTreeNode>>('api/ontologies').pipe(
      // whareReplay is placed before the map because we want each observer to get its tree, in case it modifies it.
      shareReplay(),
      map(ontologyTreeNodes => this.toTreeNodes(ontologyTreeNodes))
    );
  }

  getTree(): Observable<Array<TreeNode>> {
    return this.tree$;
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
