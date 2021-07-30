import { ChangeDetectionStrategy, Component, Input, Output, TemplateRef } from '@angular/core';
import {
  InternalTree,
  InternalTreeNode,
  NodeInformation,
  TreeNode,
  TreeService
} from './tree.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

/**
 * A relatively reusable tree component that has the following features:
 * - display a tree (obviously), where nodes can be expanded and collapsed, and where nodes must only have a text
 *   (for accessibility, and for filtering), children nodes, and can have an arbitrary payload
 * - dynamically filter the displayed tree nodes: only the nodes matching the filter, and their parent, are displayed.
 *   the other ones are hidden (but still present in the tree and affected by selections)
 * - highlight a single node to be able to display its details outside of the component
 * - provide a template to display nodes in a custom way. If not provided, only the text is displayed
 * - make nodes selectable. When a node is selected, all its descendants are also selected. When a node is deselected,
 *   all its descendants are deselected. When a parent has both selected and de-selected descendants, its checkbox is
 *   displayed as indeterminate.
 */
@Component({
  selector: 'dd-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  providers: [TreeService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'tree'
})
export class TreeComponent {
  tree$: Observable<InternalTree>;
  filterCtrl = new FormControl();

  private rootNodesSubject = new BehaviorSubject<Array<TreeNode>>([]);
  private filterSubject = new BehaviorSubject<string>('');

  @Input()
  payloadTemplate?: TemplateRef<HTMLElement>;

  @Input()
  set rootNodes(rootNodes: Array<TreeNode>) {
    this.rootNodesSubject.next(rootNodes);
  }

  @Input()
  set filter(text: string | null | undefined) {
    this.filterSubject.next((text ?? '').trim().toLowerCase());
  }

  @Output()
  highlightedNode: Observable<NodeInformation | undefined>;

  @Output()
  selectedNodes: Observable<Array<NodeInformation>>;

  constructor(private treeService: TreeService) {
    this.tree$ = treeService.treeChanges();
    this.highlightedNode = this.tree$.pipe(
      map(tree => tree.highlightedNode),
      distinctUntilChanged((a, b) => a?.id === b?.id),
      map(
        internalNodeInformation =>
          internalNodeInformation && {
            text: internalNodeInformation.text,
            payload: internalNodeInformation.payload
          }
      )
    );
    this.selectedNodes = treeService.selectedNodesChanges();

    this.rootNodesSubject
      .pipe(
        tap(rootNodes => treeService.initialize(rootNodes)),
        switchMap(() => this.filterSubject.pipe(distinctUntilChanged())),
        tap(filter => this.treeService.filter(filter))
      )
      .subscribe();
  }

  byId(index: number, node: InternalTreeNode): string {
    return node.id;
  }
}
