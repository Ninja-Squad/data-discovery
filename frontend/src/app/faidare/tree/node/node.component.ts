import { ChangeDetectionStrategy, Component, TemplateRef, inject, input } from '@angular/core';
import { InternalTreeNode, TreeService } from '../tree.service';
import { NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'dd-node',
    templateUrl: './node.component.html',
    styleUrl: './node.component.scss',
    imports: [NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeComponent<P> {
  private treeService = inject<TreeService<P>>(TreeService);

  readonly node = input.required<InternalTreeNode<P>>();
  readonly filtered = input(false);
  readonly highlightedNodeId = input<string>();
  readonly payloadTemplate = input<TemplateRef<{
    node: InternalTreeNode<P>;
}>>();

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
