import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

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
export interface TreeNode<P> {
  payload: P;
  selected?: boolean;
  children?: ReadonlyArray<TreeNode<P>>;
}

/**
 * The highlighted or selected node, as exposed by the component outputs
 */
export interface NodeInformation<P> {
  text: string;
  payload: P;
}

/**
 * The node information, as used internally
 */
interface InternalNodeInformation<P> extends NodeInformation<P> {
  id: string;
}

/**
 * The internal immutable structure used by the tree. Every time the user selects, expands of filters the tree,
 * a new copy of this structure is created and emitted.
 */
export interface InternalTree<P> {
  /**
   * Indicates if the tree is being filtered or not.
   */
  readonly filtered: boolean;

  /**
   * The root nodes of the tree
   */
  readonly rootNodes: Array<InternalTreeNode<P>>;

  /**
   * The highlighted node, if any. The same instance is reused until the ID changes
   */
  readonly highlightedNode: InternalNodeInformation<P> | undefined;
}

/**
 * The internal immutable structure used for every node, visible or not, of the tree.
 * Every time the user selects, expands of filters the tree, a new copy of this structure is created for each node.
 * The tree always keeps the same nodes, but the component decides, based on their state, if and how to display them.
 */
export interface InternalTreeNode<P> {
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
  readonly payload: P;

  /**
   * The selection state of the node, used to display the checkbox
   */
  readonly selectionState: 'CHECKED' | 'UNCHECKED' | 'INDETERMINATE';

  /**
   * The children of the node
   */
  readonly children: Array<InternalTreeNode<P>>;

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
   * expandedForced is reset to undefined and expanded thus takes its role again.
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

export type TextAccessor<P> = (payload: P) => string;
export type PayloadPredicate<P> = (payload: P) => boolean;

const NODE_COMPARATOR = (n1: InternalTreeNode<unknown>, n2: InternalTreeNode<unknown>) =>
  n1.text.localeCompare(n2.text);

@Injectable()
export class TreeService<P> {
  private tree$ = new BehaviorSubject<InternalTree<P>>({
    rootNodes: [],
    filtered: false,
    highlightedNode: undefined
  });

  treeChanges(): Observable<InternalTree<P>> {
    return this.tree$.asObservable();
  }

  selectedNodesChanges(): Observable<Array<NodeInformation<P>>> {
    return this.tree$.pipe(map(tree => this.findSelectedNodes(tree)));
  }

  initialize(rootNodes: Array<TreeNode<P>>, textAccessor: TextAccessor<P>) {
    const initialTree = this.createInitialTree(rootNodes, textAccessor);
    this.tree$.next(initialTree);
  }

  filter(text: string) {
    const tree = this.tree$.value;

    if (!tree.filtered && !text) {
      return;
    }

    const newTree: InternalTree<P> = {
      ...tree,
      filtered: !!text,
      rootNodes: tree.rootNodes.map(rootNode => this.filterRecursively(rootNode, text))
    };
    this.tree$.next(newTree);
  }

  toggleExpanded(targetNode: InternalTreeNode<P>, expanded: boolean) {
    const tree = this.tree$.value;
    const newTree: InternalTree<P> = {
      ...tree,
      rootNodes: tree.rootNodes.map(rootNode =>
        this.toggleExpandedRecursively(rootNode, targetNode, expanded)
      )
    };
    this.tree$.next(newTree);
  }

  toggleSelection(targetNode: InternalTreeNode<P>, checked: boolean) {
    const tree = this.tree$.value;
    const newTree: InternalTree<P> = {
      ...tree,
      rootNodes: tree.rootNodes.map(rootNode =>
        this.toggleSelectionRecursively(rootNode, targetNode, checked)
      )
    };
    this.tree$.next(newTree);
  }

  highlightNodeMatching(predicate: PayloadPredicate<P>) {
    const tree = this.tree$.value;

    const results = tree.rootNodes.map(rootNode =>
      this.highlightNodeMatchingRecursively(rootNode, predicate)
    );
    const targetNode = results.find(result => result.highlightedNode)?.highlightedNode;
    const highlightedNode: InternalNodeInformation<P> | undefined = targetNode
      ? { id: targetNode.id, text: targetNode.text, payload: targetNode.payload }
      : undefined;

    const newTree: InternalTree<P> = {
      ...tree,
      rootNodes: results.map(result => result.transformedNode),
      highlightedNode
    };
    this.tree$.next(newTree);
  }

  highlight(targetNode: InternalTreeNode<P>) {
    const tree = this.tree$.value;
    const newTree: InternalTree<P> = {
      ...tree,
      highlightedNode: { id: targetNode.id, text: targetNode.text, payload: targetNode.payload }
    };
    this.tree$.next(newTree);
  }

  changeText(textAccessor: TextAccessor<P>) {
    const tree = this.tree$.value;
    const newTree: InternalTree<P> = {
      ...tree,
      rootNodes: tree.rootNodes
        .map(rootNode => this.changeTextRecursively(rootNode, textAccessor))
        .sort(NODE_COMPARATOR)
    };
    this.tree$.next(newTree);
  }

  private filterRecursively(node: InternalTreeNode<P>, text: string): InternalTreeNode<P> {
    const filteringActive = !!text;
    const matchingFilter = filteringActive && node.text.toLowerCase().includes(text);
    const newChildren = node.children.map(childNode => this.filterRecursively(childNode, text));
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

  private toggleExpandedRecursively(
    node: InternalTreeNode<P>,
    targetNode: InternalTreeNode<P>,
    expanded: boolean
  ): InternalTreeNode<P> {
    return {
      ...node,
      expanded: node === targetNode ? expanded : node.expanded,
      expandedForced: node === targetNode ? undefined : node.expandedForced,
      children:
        node === targetNode
          ? node.children
          : node.children.map(childNode =>
              this.toggleExpandedRecursively(childNode, targetNode, expanded)
            )
    };
  }

  private toggleSelectionRecursively(
    node: InternalTreeNode<P>,
    targetNode: InternalTreeNode<P>,
    checked: boolean
  ): InternalTreeNode<P> {
    const statesFound = new Set<NodeSelectionState>();

    const newChildren = node.children.map(childNode => {
      const newChildNode = this.toggleSelectionRecursively(
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
        newSelectionState = statesFound.values().next().value!;
      }
    }

    return {
      ...node,
      selectionState: newSelectionState,
      children: newChildren
    };
  }

  private changeTextRecursively(
    node: InternalTreeNode<P>,
    textAccessor: TextAccessor<P>
  ): InternalTreeNode<P> {
    const children = node.children
      .map(childNode => this.changeTextRecursively(childNode, textAccessor))
      .sort(NODE_COMPARATOR);
    return {
      ...node,
      text: textAccessor(node.payload),
      children
    };
  }

  private createInitialTree(
    rootNodes: Array<TreeNode<P>>,
    textAccessor: TextAccessor<P>
  ): InternalTree<P> {
    return {
      filtered: false,
      rootNodes: rootNodes
        .map(node => this.createInternalNode(node, textAccessor))
        .sort(NODE_COMPARATOR),
      highlightedNode: undefined
    };
  }

  private createInternalNode(
    node: TreeNode<P>,
    textAccessor: TextAccessor<P>
  ): InternalTreeNode<P> {
    const statesFound = new Set<NodeSelectionState>();
    const children = (node.children ?? [])
      .map(childNode => {
        const childInternalNode = this.createInternalNode(childNode, textAccessor);
        statesFound.add(childInternalNode.selectionState);
        return childInternalNode;
      })
      .sort(NODE_COMPARATOR);

    let selectionState: NodeSelectionState = 'UNCHECKED';
    if (children.length) {
      if (statesFound.size > 1) {
        selectionState = 'INDETERMINATE';
      } else if (statesFound.size === 1) {
        selectionState = statesFound.values().next().value!;
      }
    } else {
      selectionState = node.selected ? 'CHECKED' : 'UNCHECKED';
    }
    const hasVisibleChildren = !!node.children && node.children.length > 0;
    return {
      id: `dd-tree-node-${idCounter++}`,
      text: textAccessor(node.payload),
      payload: node.payload,
      matchingFilter: false,
      hasVisibleChildren,
      selectionState,
      expanded: hasVisibleChildren && selectionState !== 'UNCHECKED',
      expandedForced: false,
      children
    };
  }

  private findSelectedNodes(tree: InternalTree<P>): Array<NodeInformation<P>> {
    const selectedNodes: Array<NodeInformation<P>> = [];
    tree.rootNodes.forEach(node => this.findSelectedNodesInNode(node, selectedNodes));
    return selectedNodes;
  }

  private findSelectedNodesInNode(
    node: InternalTreeNode<P>,
    selectedNodes: Array<NodeInformation<P>>
  ): void {
    if (node.selectionState === 'CHECKED' && node.children.length === 0) {
      selectedNodes.push({ text: node.text, payload: node.payload });
    }
    if (node.selectionState !== 'UNCHECKED') {
      node.children.forEach(childNode => this.findSelectedNodesInNode(childNode, selectedNodes));
    }
  }

  private highlightNodeMatchingRecursively(
    node: InternalTreeNode<P>,
    predicate: PayloadPredicate<P>
  ): { transformedNode: InternalTreeNode<P>; highlightedNode?: InternalTreeNode<P> } {
    const matching = predicate(node.payload);
    if (matching) {
      return { transformedNode: node, highlightedNode: node };
    } else {
      const childrenResults = node.children.map(childNode =>
        this.highlightNodeMatchingRecursively(childNode, predicate)
      );
      const highlightedNode = childrenResults.find(
        result => result.highlightedNode
      )?.highlightedNode;

      if (highlightedNode) {
        const transformedNode = {
          ...node,
          expanded: true,
          children: childrenResults.map(result => result.transformedNode)
        };

        return { transformedNode, highlightedNode };
      } else {
        return { transformedNode: node };
      }
    }
  }
}
