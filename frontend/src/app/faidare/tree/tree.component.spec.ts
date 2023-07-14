import { TestBed } from '@angular/core/testing';

import { TreeComponent } from './tree.component';
import { Component } from '@angular/core';
import { NodeInformation, NodeSelectionState, TextAccessor, TreeNode } from './tree.service';
import { ComponentTester, TestHtmlElement } from 'ngx-speculoos';
import { NgIf } from '@angular/common';

interface TestPayload {
  id: string;
  type?: string;
}

@Component({
  template: `
    <ng-template #payloadTemplate let-node="node">
      {{ node.text }}
      <span *ngIf="node.payload?.type" class="badge bg-info">{{ node.payload?.type }}</span>
    </ng-template>
    <dd-tree
      [filter]="filter"
      [rootNodes]="rootNodes"
      [payloadTemplate]="payloadTemplate"
      [textAccessor]="textAccessor"
      (selectedNodes)="selectedNodes = $event"
      (highlightedNode)="highlightedNode = $event"
    ></dd-tree>
  `,
  standalone: true,
  imports: [NgIf, TreeComponent]
})
class TestComponent {
  rootNodes: Array<TreeNode<TestPayload>> = [
    {
      payload: { id: 'b' },
      children: [
        {
          payload: { id: 'b1' },
          children: [
            {
              payload: { id: 'b11' },
              selected: true
            },
            {
              payload: { id: 'b12' },
              selected: true
            }
          ]
        },
        {
          payload: { id: 'b2' },
          children: [
            {
              payload: { id: 'b21' }
            },
            {
              payload: { id: 'b22' }
            }
          ]
        }
      ]
    },
    {
      payload: { id: 'a' },
      children: [
        {
          payload: { id: 'a1' },
          children: [
            {
              payload: {
                id: 'a11',
                type: 'foo'
              }
            },
            {
              payload: { id: 'a12' }
            }
          ]
        },
        {
          payload: { id: 'a2' },
          children: [
            {
              payload: { id: 'a21' }
            },
            {
              payload: { id: 'a22' }
            }
          ]
        }
      ]
    }
  ];
  textAccessor: TextAccessor<TestPayload> = payload => payload.id.toUpperCase();
  selectedNodes: Array<NodeInformation<TestPayload>> = [];
  highlightedNode: NodeInformation<TestPayload> | undefined;

  filter: string | null = null;
}

class TestNode {
  constructor(private element: TestHtmlElement<HTMLElement>) {}

  get text() {
    return this.element.element('label')?.textContent?.trim();
  }

  get expander() {
    return this.element.element<HTMLElement>('.expand') ?? null;
  }

  get checkbox() {
    return this.element.input('input');
  }

  get visible() {
    return this.element.visible;
  }

  get selectionState(): NodeSelectionState {
    const cb = this.checkbox;
    if (cb?.nativeElement.indeterminate) {
      return 'INDETERMINATE';
    } else if (cb.checked) {
      return 'CHECKED';
    } else {
      return 'UNCHECKED';
    }
  }

  get payload() {
    return this.element.element<HTMLElement>('.node-payload');
  }
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  node(text: string): TestNode | null {
    const element =
      this.elements<HTMLElement>('dd-node').find(
        el => el.element('label')?.textContent?.trim() === text
      ) ?? null;

    return element ? new TestNode(element) : null;
  }

  get nodes(): Array<TestNode> {
    return this.elements<HTMLElement>('dd-node').map(element => new TestNode(element));
  }

  get visibleNodes(): Array<TestNode> {
    return this.nodes.filter(testNode => testNode.visible);
  }

  get checkedNodes(): Array<TestNode> {
    return this.nodes.filter(testNode => testNode.selectionState === 'CHECKED');
  }

  get uncheckedNodes(): Array<TestNode> {
    return this.nodes.filter(testNode => testNode.selectionState === 'UNCHECKED');
  }

  get indeterminateNodes(): Array<TestNode> {
    return this.nodes.filter(testNode => testNode.selectionState === 'INDETERMINATE');
  }
}

describe('TreeComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should create a tree, pre-select nodes, and pre-expand nodes so that selected nodes are visible', () => {
    expect(tester.nodes.length).toBe(6);
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'B', 'B1', 'B11', 'B12', 'B2']);
    expect(tester.componentInstance.selectedNodes).toEqual([
      {
        text: 'B11',
        payload: { id: 'b11' }
      },
      {
        text: 'B12',
        payload: { id: 'b12' }
      }
    ]);
    expect(tester.checkedNodes.map(n => n.text)).toEqual(['B1', 'B11', 'B12']);
    expect(tester.uncheckedNodes.map(n => n.text)).toEqual(['A', 'B2']);
    expect(tester.indeterminateNodes.map(n => n.text)).toEqual(['B']);
  });

  it('should expand and collapse nodes', () => {
    // collapse B
    tester.node('B').expander.click();
    // expand A
    tester.node('A').expander.click();

    expect(tester.node('A').expander).toHaveClass('expanded');
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A1', 'A2', 'B']);

    tester.node('A2').expander.click();

    expect(tester.node('A2').expander).toHaveClass('expanded');
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A1', 'A2', 'A21', 'A22', 'B']);

    expect(tester.node('A21').expander).toBeNull();

    tester.node('A').expander.click();
    expect(tester.node('A').expander).not.toHaveClass('expanded');
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'B']);

    tester.node('A').expander.click();
    expect(tester.node('A').expander).toHaveClass('expanded');
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A1', 'A2', 'A21', 'A22', 'B']);
  });

  it('should select and deselect nodes', () => {
    // expand A
    tester.node('A').expander.click();
    // expand A1
    tester.node('A1').expander.click();
    // check A1
    tester.node('A1').checkbox.check();

    expect(tester.componentInstance.selectedNodes).toEqual([
      {
        text: 'A11',
        payload: {
          id: 'a11',
          type: 'foo'
        }
      },
      {
        text: 'A12',
        payload: { id: 'a12' }
      },
      {
        text: 'B11',
        payload: { id: 'b11' }
      },
      {
        text: 'B12',
        payload: { id: 'b12' }
      }
    ]);
    expect(tester.checkedNodes.map(n => n.text)).toEqual(['A1', 'A11', 'A12', 'B1', 'B11', 'B12']);
    expect(tester.uncheckedNodes.map(n => n.text)).toEqual(['A2', 'B2']);
    expect(tester.indeterminateNodes.map(n => n.text)).toEqual(['A', 'B']);

    tester.node('A11').checkbox.uncheck();
    expect(tester.componentInstance.selectedNodes).toEqual([
      {
        text: 'A12',
        payload: { id: 'a12' }
      },
      {
        text: 'B11',
        payload: { id: 'b11' }
      },
      {
        text: 'B12',
        payload: { id: 'b12' }
      }
    ]);
    expect(tester.checkedNodes.map(n => n.text)).toEqual(['A12', 'B1', 'B11', 'B12']);
    expect(tester.uncheckedNodes.map(n => n.text)).toEqual(['A11', 'A2', 'B2']);
    expect(tester.indeterminateNodes.map(n => n.text)).toEqual(['A', 'A1', 'B']);
  });

  it('should filter nodes and restore their expanded status when unfiltering', () => {
    tester.node('A').expander.click();

    tester.componentInstance.filter = 'A';
    tester.detectChanges();

    expect(tester.visibleNodes.map(n => n.text)).toEqual([
      'A',
      'A1',
      'A11',
      'A12',
      'A2',
      'A21',
      'A22'
    ]);

    tester.componentInstance.filter = 'A2';
    tester.detectChanges();

    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A2', 'A21', 'A22']);

    tester.componentInstance.filter = 'A22';
    tester.detectChanges();

    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A2', 'A22']);

    tester.componentInstance.filter = 'A223';
    tester.detectChanges();

    expect(tester.visibleNodes.map(n => n.text)).toEqual([]);

    tester.componentInstance.filter = '';
    tester.detectChanges();

    expect(tester.visibleNodes.map(n => n.text)).toEqual([
      'A',
      'A1',
      'A2',
      'B',
      'B1',
      'B11',
      'B12',
      'B2'
    ]);
  });

  it('should change the text accessor', () => {
    tester.componentInstance.textAccessor = payload =>
      (payload.id.startsWith('a') ? 'z' + payload.id : payload.id) + '!';
    tester.detectChanges();
    expect(tester.visibleNodes.map(n => n.text)).toEqual([
      'b!',
      'b1!',
      'b11!',
      'b12!',
      'b2!',
      'za!'
    ]);
  });

  it('should honor the node template', () => {
    tester.node('A').expander.click();
    tester.node('A1').expander.click();
    expect(tester.node('A').payload.textContent.trim()).toBe('A');
    expect(tester.node('A11').payload).toContainText('A11 foo');
  });

  it('should highlight nodes', () => {
    tester.node('A').expander.click();
    tester.node('A1').expander.click();
    tester.node('A').payload.click();
    expect(tester.componentInstance.highlightedNode).toEqual({ text: 'A', payload: { id: 'a' } });

    tester.node('A11').payload.click();
    expect(tester.componentInstance.highlightedNode).toEqual({
      text: 'A11',
      payload: {
        id: 'a11',
        type: 'foo'
      }
    });
  });
});
