import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { InternalTreeNode, TreeService } from '../tree.service';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'dd-node',
  templateUrl: './node.component.html',
  styleUrl: './node.component.scss',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeComponent<P> {
  @Input() node!: InternalTreeNode<P>;
  @Input() filtered = false;
  @Input() highlightedNodeId: string | undefined;
  @Input() payloadTemplate?: TemplateRef<{ node: InternalTreeNode<P> }>;

  constructor(private treeService: TreeService<P>) {}

  toggleExpanded() {
    this.treeService.toggleExpanded(this.node, !(this.node.expanded || this.node.expandedForced));
  }

  toggleSelection(checked: boolean) {
    this.treeService.toggleSelection(this.node, checked);
  }

  highlight() {
    this.treeService.highlight(this.node);
  }
}
