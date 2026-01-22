import { ChangeDetectionStrategy, Component, inject, input, TemplateRef } from '@angular/core';
import { InternalTreeNode, TreeService } from '../tree.service';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'dd-node',
  templateUrl: './node.component.html',
  styleUrl: './node.component.scss',
  imports: [NgTemplateOutlet, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeComponent<P> {
  private readonly treeService = inject<TreeService<P>>(TreeService);

  readonly node = input.required<InternalTreeNode<P>>();
  readonly filtered = input(false);
  readonly highlightedNodeId = input<string>();
  readonly payloadTemplate = input<
    TemplateRef<{
      node: InternalTreeNode<P>;
    }>
  >();
  readonly selectionVisible = input(true);

  toggleExpanded() {
    const node = this.node();
    this.treeService.toggleExpanded(this.node(), !(node.expanded || node.expandedForced));
  }

  toggleSelection(checked: boolean) {
    this.treeService.toggleSelection(this.node(), checked);
  }

  highlight() {
    this.treeService.highlight(this.node());
  }
}
