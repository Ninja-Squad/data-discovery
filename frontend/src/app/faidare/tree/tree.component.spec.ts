import { TestBed } from '@angular/core/testing';

import { TreeComponent } from './tree.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NodeInformation, NodeSelectionState, TextAccessor, TreeNode } from './tree.service';
import { ComponentTester, TestHtmlElement } from 'ngx-speculoos';

interface TestPayload {
  id: string;
  type?: string;
}

@Component({
  template: `
    <ng-template #payloadTemplate let-node="node">
      {{ node.text }}
      @if (node.payload?.type) {
        <span class="badge bg-info">{{ node.payload?.type }}</span>
      }
    </ng-template>
    <dd-tree
      [filter]="filter()"
      [rootNodes]="rootNodes()"
      [payloadTemplate]="payloadTemplate"
      [textAccessor]="textAccessor()"
      (selectedNodes)="selectedNodes.set($event)"
      (highlightedNode)="highlightedNode.set($event)"
    />
  `,
  imports: [TreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  rootNodes = signal<Array<TreeNode<TestPayload>>>([
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
  ]);
  textAccessor = signal<TextAccessor<TestPayload>>(payload => payload.id.toUpperCase());
  selectedNodes = signal<Array<NodeInformation<TestPayload>>>([]);
  highlightedNode = signal<NodeInformation<TestPayload> | undefined>(undefined);

  filter = signal<string | null>(null);
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

  beforeEach(async () => {
    TestBed.configureTestingModule({});

    tester = new TestComponentTester();
    await tester.stable();
  });

  it('should create a tree, pre-select nodes, and pre-expand nodes so that selected nodes are visible', () => {
    expect(tester.nodes.length).toBe(6);
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'B', 'B1', 'B11', 'B12', 'B2']);
    expect(tester.componentInstance.selectedNodes()).toEqual([
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

  it('should expand and collapse nodes', async () => {
    // collapse B
    await tester.node('B').expander.click();
    // expand A
    await tester.node('A').expander.click();

    expect(tester.node('A').expander).toHaveClass('expanded');
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A1', 'A2', 'B']);

    await tester.node('A2').expander.click();

    expect(tester.node('A2').expander).toHaveClass('expanded');
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A1', 'A2', 'A21', 'A22', 'B']);

    expect(tester.node('A21').expander).toBeNull();

    await tester.node('A').expander.click();
    expect(tester.node('A').expander).not.toHaveClass('expanded');
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'B']);

    await tester.node('A').expander.click();
    expect(tester.node('A').expander).toHaveClass('expanded');
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A1', 'A2', 'A21', 'A22', 'B']);
  });

  it('should select and deselect nodes', async () => {
    // expand A
    await tester.node('A').expander.click();
    // expand A1
    await tester.node('A1').expander.click();
    // check A1
    await tester.node('A1').checkbox.check();

    expect(tester.componentInstance.selectedNodes()).toEqual([
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

    await tester.node('A11').checkbox.uncheck();
    expect(tester.componentInstance.selectedNodes()).toEqual([
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

  it('should filter nodes and restore their expanded status when unfiltering', async () => {
    await tester.node('A').expander.click();

    tester.componentInstance.filter.set('A');
    await tester.stable();

    expect(tester.visibleNodes.map(n => n.text)).toEqual([
      'A',
      'A1',
      'A11',
      'A12',
      'A2',
      'A21',
      'A22'
    ]);

    tester.componentInstance.filter.set('A2');
    await tester.stable();

    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A2', 'A21', 'A22']);

    tester.componentInstance.filter.set('A22');
    await tester.stable();

    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A2', 'A22']);

    tester.componentInstance.filter.set('A223');
    await tester.stable();

    expect(tester.visibleNodes.map(n => n.text)).toEqual([]);

    tester.componentInstance.filter.set('');
    await tester.stable();

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

  it('should change the text accessor', async () => {
    tester.componentInstance.textAccessor.set(
      payload => (payload.id.startsWith('a') ? 'z' + payload.id : payload.id) + '!'
    );
    await tester.stable();
    expect(tester.visibleNodes.map(n => n.text)).toEqual([
      'b!',
      'b1!',
      'b11!',
      'b12!',
      'b2!',
      'za!'
    ]);
  });

  it('should honor the node template', async () => {
    await tester.node('A').expander.click();
    await tester.node('A1').expander.click();
    expect(tester.node('A').payload.textContent.trim()).toBe('A');
    expect(tester.node('A11').payload).toContainText('A11 foo');
  });

  it('should highlight nodes', async () => {
    await tester.node('A').expander.click();
    await tester.node('A1').expander.click();
    await tester.node('A').payload.click();
    expect(tester.componentInstance.highlightedNode()).toEqual({ text: 'A', payload: { id: 'a' } });

    await tester.node('A11').payload.click();
    expect(tester.componentInstance.highlightedNode()).toEqual({
      text: 'A11',
      payload: {
        id: 'a11',
        type: 'foo'
      }
    });
  });
});
