import { ChangeDetectionStrategy, Component, inject, Input, OnInit, OutputRef, TemplateRef } from '@angular/core';
import { InternalTree, InternalTreeNode, NodeInformation, TextAccessor, TreeNode, TreeService } from './tree.service';
import { BehaviorSubject, distinctUntilChanged, map, merge, Observable, skip, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NodeComponent } from './node/node.component';
import { outputFromObservable } from '@angular/core/rxjs-interop';

interface BaseAction {
  type: 'FILTER' | 'CHANGE_TEXT';
}

interface FilterAction extends BaseAction {
  type: 'FILTER';
  filter: string;
}

interface ChangeTextAction<P> extends BaseAction {
  type: 'CHANGE_TEXT';
  textAccessor: TextAccessor<P>;
}

type Action<P> = FilterAction | ChangeTextAction<P>;

const DEFAULT_TEXT_ACCESSOR: TextAccessor<any> = () => 'no text accessor provided';

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
    styleUrl: './tree.component.scss',
    providers: [TreeService],
    imports: [AsyncPipe, NodeComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'tree'
})
export class TreeComponent<P> implements OnInit {
  private treeService = inject(TreeService)

  tree$: Observable<InternalTree<P>> = this.treeService.treeChanges();

  private rootNodesSubject = new BehaviorSubject<Array<TreeNode<P>>>([]);
  private filterSubject = new BehaviorSubject<string>('');
  private textAccessorSubject = new BehaviorSubject<TextAccessor<P>>(DEFAULT_TEXT_ACCESSOR);

  @Input()
  payloadTemplate?: TemplateRef<{ node: InternalTreeNode<P> }>;

  @Input()
  set rootNodes(rootNodes: Array<TreeNode<P>>) {
    this.rootNodesSubject.next(rootNodes);
  }

  @Input()
  set filter(text: string | null | undefined) {
    this.filterSubject.next((text ?? '').trim().toLowerCase());
  }

  @Input()
  set textAccessor(textAccessor: TextAccessor<P> | null) {
    this.textAccessorSubject.next(textAccessor ?? DEFAULT_TEXT_ACCESSOR);
  }

  highlightedNode: OutputRef<NodeInformation<P> | undefined> = outputFromObservable(
    this.tree$.pipe(
      map(tree => tree.highlightedNode),
      distinctUntilChanged((a, b) => a?.id === b?.id),
      map(
        internalNodeInformation =>
          internalNodeInformation && {
            text: internalNodeInformation.text,
            payload: internalNodeInformation.payload
          }
      )
    )
  )

  selectedNodes: OutputRef<Array<NodeInformation<P>>> = outputFromObservable(
    this.treeService.selectedNodesChanges()
  );

  ngOnInit(): void {
    const filterActions$: Observable<FilterAction> = this.filterSubject.pipe(
      distinctUntilChanged(),
      map(filter => ({ type: 'FILTER', filter }))
    );

    const changeTextActions$: Observable<ChangeTextAction<P>> = this.textAccessorSubject.pipe(
      skip(1),
      map(textAccessor => ({ type: 'CHANGE_TEXT', textAccessor }))
    );

    const actions$: Observable<Action<P>> = merge(filterActions$, changeTextActions$);

    this.rootNodesSubject
      .pipe(
        tap(rootNodes => this.treeService.initialize(rootNodes, this.textAccessorSubject.value)),
        switchMap(() => actions$),
        tap(action => {
          switch (action.type) {
            case 'FILTER':
              this.treeService.filter(action.filter);
              break;
            case 'CHANGE_TEXT':
              this.treeService.changeText(action.textAccessor);
              break;
          }
        })
      )
      .subscribe();
  }
}
