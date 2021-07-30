import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { InternalTreeNode, TreeService } from '../tree.service';

@Component({
  selector: 'dd-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeComponent {
  @Input() node!: InternalTreeNode;
  @Input() filtered = false;
  @Input() highlightedNodeId: string | undefined;
  @Input() payloadTemplate?: TemplateRef<HTMLElement>;

  constructor(private treeService: TreeService) {}

  toggleExpanded() {
    this.treeService.toggleExpanded(this.node, !(this.node.expanded || this.node.expandedForced));
  }

  toggleSelection(checked: boolean) {
    this.treeService.toggleSelection(this.node, checked);
  }

  highlight() {
    this.treeService.highlight(this.node);
  }

  byId(index: number, node: InternalTreeNode): string {
    return node.id;
  }
}
