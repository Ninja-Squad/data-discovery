import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OutputRef,
  TemplateRef
} from '@angular/core';
import {
  InternalTree,
  InternalTreeNode,
  NodeInformation,
  TextAccessor,
  TreeNode,
  TreeService
} from './tree.service';
import { distinctUntilChanged, map, merge, Observable, skip, switchMap, tap } from 'rxjs';
import { NodeComponent } from './node/node.component';
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';

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

const DEFAULT_TEXT_ACCESSOR: TextAccessor<unknown> = () => 'no text accessor provided';

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
  imports: [NodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'tree'
})
export class TreeComponent<P> {
  private treeService = inject(TreeService);

  private tree$: Observable<InternalTree<P>> = this.treeService.treeChanges();
  readonly tree = toSignal(this.tree$);

  readonly payloadTemplate = input<
    TemplateRef<{
      node: InternalTreeNode<P>;
    }>
  >();

  readonly rootNodes = input.required<Array<TreeNode<P>>>();
  readonly filter = input.required<string | null | undefined>();
  readonly textAccessor = input.required<TextAccessor<P> | null>();

  readonly sanitizedFilter = computed(() => (this.filter() ?? '').trim().toLowerCase());
  readonly sanitizedTextAccessor = computed(() => this.textAccessor() ?? DEFAULT_TEXT_ACCESSOR);

  readonly highlightedNode: OutputRef<NodeInformation<P> | undefined> = outputFromObservable(
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
  );

  readonly selectedNodes: OutputRef<Array<NodeInformation<P>>> = outputFromObservable(
    this.treeService.selectedNodesChanges()
  );

  constructor() {
    const filterActions$: Observable<FilterAction> = toObservable(this.sanitizedFilter).pipe(
      map(filter => ({ type: 'FILTER', filter }))
    );

    const changeTextActions$: Observable<ChangeTextAction<P>> = toObservable(
      this.sanitizedTextAccessor
    ).pipe(
      skip(1),
      map(textAccessor => ({ type: 'CHANGE_TEXT', textAccessor }))
    );

    const actions$: Observable<Action<P>> = merge(filterActions$, changeTextActions$);

    toObservable(this.rootNodes)
      .pipe(
        tap(rootNodes => this.treeService.initialize(rootNodes, this.sanitizedTextAccessor())),
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
