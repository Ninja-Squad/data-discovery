import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type NodeSelectionState = 'CHECKED' | 'UNCHECKED' | 'INDETERMINATE';

/**
 * The counter used to generate unique IDs for nodes, used for checkbox labels and for trackBy
 */
let idCounter = 0;

/**
 * A tree node as provided to this service (and to the component as input) to create the internal tree structure.
 * The `selected` flag is used to pre-select the nodes. It should typically only be set to true on leaf nodes: the
 * selection state of their parent will be automatically computed.
 */
export interface TreeNode {
  text: string;
  payload?: unknown;
  selected?: boolean;
  children?: ReadonlyArray<TreeNode>;
}

/**
 * The highlighted or selected node, as exposed by the component outputs
 */
export interface NodeInformation {
  text: string;
  payload?: unknown;
}

/**
 * The node information, as used internally
 */
export interface InternalNodeInformation extends NodeInformation {
  id: string;
}

/**
 * The internal immutable structure used by the tree. Every time the user selects, expands of filters the tree,
 * a new copy of this structure is created and emitted.
 */
export interface InternalTree {
  /**
   * Indicates if the tree is being filtered or not.
   */
  readonly filtered: boolean;

  /**
   * The root nodes of the tree
   */
  readonly rootNodes: Array<InternalTreeNode>;

  /**
   * The highlighted node, if any. The same instance is reused until the ID changes
   */
  readonly highlightedNode: InternalNodeInformation | undefined;
}

/**
 * The internal immutable structure used for every node, visible or not, of the tree.
 * Every time the user selects, expands of filters the tree, a new copy of this structure is created for each node.
 * The tree always keeps the same nodes, but the component decides, based on their state, if and how to display them.
 */
export interface InternalTreeNode {
  /**
   * The internal ID of the node, used for the checkbox label and for trackBy
   */
  readonly id: string;

  /**
   * The text displayed by the node
   */
  readonly text: string;

  /**
   * The payload of the node, which can be anything
   */
  readonly payload: unknown;

  /**
   * The selection state of the node, used to display the checkbox
   */
  readonly selectionState: 'CHECKED' | 'UNCHECKED' | 'INDETERMINATE';

  /**
   * The children of the node
   */
  readonly children: Array<InternalTreeNode>;

  /**
   * true if the tree is being filtered and if this node matches the filter
   */
  readonly matchingFilter: boolean;

  /**
   * true if this node has visible children, i.e. if it's not filtered and has children, or if it's filtered and has
   * at least one descendant which matches the filter
   */
  readonly hasVisibleChildren: boolean;

  /**
   * true if this node is expanded. When filtering is used, the filtering forces a node to be expanded or not by
   * setting expandedForced to true or false, if the node has a descendant which matches the filter or not.
   * So, if expandedForced is defined, then it is prioritized over expanded. When filtering is canceled,
   * expandedForced is rest to undefined and expanded thus takes its role again.
   * Explicitly expanding or collapsing a node after filtering also resets expandedForced to undefined.
   */
  readonly expanded: boolean;

  /**
   * true if this node is forced to be expanded by the filtering;
   * false if this node is forced to be collapsed by the filtering;
   * undefined if no filtering has been done, or if the user has explicitly collapsed or expanded a node after filtering
   */
  readonly expandedForced: boolean | undefined;
}

@Injectable()
export class TreeService {
  private tree$ = new BehaviorSubject<InternalTree>({
    rootNodes: [],
    filtered: false,
    highlightedNode: undefined
  });

  treeChanges(): Observable<InternalTree> {
    return this.tree$.asObservable();
  }

  selectedNodesChanges(): Observable<Array<NodeInformation>> {
    return this.tree$.pipe(map(tree => this.findSelectedNodes(tree)));
  }

  initialize(rootNodes: Array<TreeNode>) {
    const initialTree = this.createInitialTree(rootNodes);
    this.tree$.next(initialTree);
  }

  filter(text: string) {
    const tree = this.tree$.value;

    if (!tree.filtered && !text) {
      return;
    }

    const newTree: InternalTree = {
      ...tree,
      filtered: !!text,
      rootNodes: tree.rootNodes.map(rootNode => this.filterNode(rootNode, text))
    };
    this.tree$.next(newTree);
  }

  toggleExpanded(targetNode: InternalTreeNode, expanded: boolean) {
    const tree = this.tree$.value;
    const newTree: InternalTree = {
      ...tree,
      rootNodes: tree.rootNodes.map(rootNode =>
        this.toggleExpandedNode(rootNode, targetNode, expanded)
      )
    };
    this.tree$.next(newTree);
  }

  toggleSelection(targetNode: InternalTreeNode, checked: boolean) {
    const tree = this.tree$.value;
    const newTree: InternalTree = {
      ...tree,
      rootNodes: tree.rootNodes.map(rootNode =>
        this.toggleSelectionNode(rootNode, targetNode, checked)
      )
    };
    this.tree$.next(newTree);
  }

  highlight(targetNode: InternalTreeNode) {
    const tree = this.tree$.value;
    const newTree: InternalTree = {
      ...tree,
      highlightedNode: { id: targetNode.id, text: targetNode.text, payload: targetNode.payload }
    };
    this.tree$.next(newTree);
  }

  private filterNode(node: InternalTreeNode, text: string): InternalTreeNode {
    const filteringActive = !!text;
    const matchingFilter = filteringActive && node.text.toLowerCase().includes(text);
    const newChildren = node.children.map(childNode => this.filterNode(childNode, text));
    const hasVisibleChildren =
      (!filteringActive && newChildren.length > 0) ||
      newChildren.some(c => c.matchingFilter || c.hasVisibleChildren);
    return {
      ...node,
      matchingFilter,
      hasVisibleChildren,
      expandedForced: filteringActive && hasVisibleChildren,
      children: newChildren
    };
  }

  private toggleExpandedNode(
    node: InternalTreeNode,
    targetNode: InternalTreeNode,
    expanded: boolean
  ): InternalTreeNode {
    return {
      ...node,
      expanded: node === targetNode ? expanded : node.expanded,
      expandedForced: node === targetNode ? undefined : node.expandedForced,
      children:
        node === targetNode
          ? node.children
          : node.children.map(childNode => this.toggleExpandedNode(childNode, targetNode, expanded))
    };
  }

  private toggleSelectionNode(
    node: InternalTreeNode,
    targetNode: InternalTreeNode,
    checked: boolean
  ): InternalTreeNode {
    const statesFound = new Set<NodeSelectionState>();

    const newChildren = node.children.map(childNode => {
      const newChildNode = this.toggleSelectionNode(
        childNode,
        targetNode === node ? childNode : targetNode,
        checked
      );
      statesFound.add(newChildNode.selectionState);
      return newChildNode;
    });

    let newSelectionState = node.selectionState;
    if (targetNode === node) {
      newSelectionState = checked ? 'CHECKED' : 'UNCHECKED';
    } else {
      if (statesFound.size > 1) {
        newSelectionState = 'INDETERMINATE';
      } else if (statesFound.size === 1) {
        newSelectionState = statesFound.values().next().value;
      }
    }

    return {
      ...node,
      selectionState: newSelectionState,
      children: newChildren
    };
  }

  private createInitialTree(rootNodes: Array<TreeNode>): InternalTree {
    return {
      filtered: false,
      rootNodes: rootNodes.map(node => this.createInternalNode(node)),
      highlightedNode: undefined
    };
  }

  private createInternalNode(node: TreeNode): InternalTreeNode {
    const statesFound = new Set<NodeSelectionState>();
    const children = (node.children ?? []).map(childNode => {
      const childInternalNode = this.createInternalNode(childNode);
      statesFound.add(childInternalNode.selectionState);
      return childInternalNode;
    });

    let selectionState: NodeSelectionState = 'UNCHECKED';
    if (children.length) {
      if (statesFound.size > 1) {
        selectionState = 'INDETERMINATE';
      } else if (statesFound.size === 1) {
        selectionState = statesFound.values().next().value;
      }
    } else {
      selectionState = node.selected ? 'CHECKED' : 'UNCHECKED';
    }
    const hasVisibleChildren = !!node.children && node.children.length > 0;
    return {
      id: `dd-tree-node-${idCounter++}`,
      text: node.text,
      payload: node.payload,
      matchingFilter: false,
      hasVisibleChildren,
      selectionState,
      expanded: hasVisibleChildren && selectionState !== 'UNCHECKED',
      expandedForced: false,
      children
    };
  }

  private findSelectedNodes(tree: InternalTree): Array<NodeInformation> {
    const selectedNodes: Array<NodeInformation> = [];
    tree.rootNodes.forEach(node => this.findSelectedNodesInNode(node, selectedNodes));
    return selectedNodes;
  }

  private findSelectedNodesInNode(
    node: InternalTreeNode,
    selectedNodes: Array<NodeInformation>
  ): void {
    if (node.selectionState === 'CHECKED' && node.children.length === 0) {
      selectedNodes.push({ text: node.text, payload: node.payload });
    }
    if (node.selectionState !== 'UNCHECKED') {
      node.children.forEach(childNode => this.findSelectedNodesInNode(childNode, selectedNodes));
    }
  }
}
