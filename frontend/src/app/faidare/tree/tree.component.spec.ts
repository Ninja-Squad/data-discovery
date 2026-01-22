import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import { TreeComponent } from './tree.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NodeInformation, NodeSelectionState, TextAccessor, TreeNode } from './tree.service';
import { provideI18nTesting } from '../../i18n/mock-18n';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-tree-tester'
})
class TestComponent {
  readonly rootNodes = signal<Array<TreeNode<TestPayload>>>([
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
  readonly textAccessor = signal<TextAccessor<TestPayload>>(payload => payload.id.toUpperCase());
  readonly selectedNodes = signal<Array<NodeInformation<TestPayload>>>([]);
  readonly highlightedNode = signal<NodeInformation<TestPayload> | undefined>(undefined);
  readonly filter = signal<string | null>(null);
}

class TestNode {
  constructor(private element: HTMLElement) {}

  get text() {
    return this.element.querySelector('label')?.textContent?.trim();
  }

  get expander() {
    return this.element.querySelector<HTMLElement>('.expand') ?? null;
  }

  get checkbox() {
    return this.element.querySelector<HTMLInputElement>('input') ?? null;
  }

  get visible() {
    return this.element.offsetParent !== null;
  }

  get selectionState(): NodeSelectionState {
    const cb = this.checkbox;
    if (cb?.indeterminate) {
      return 'INDETERMINATE';
    } else if (cb?.checked) {
      return 'CHECKED';
    } else {
      return 'UNCHECKED';
    }
  }

  get payload() {
    return this.element.querySelector<HTMLElement>('.node-payload');
  }
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  node(text: string): TestNode | null {
    const elements = Array.from(
      this.fixture.nativeElement.querySelectorAll('dd-node') as NodeListOf<HTMLElement>
    );
    const element =
      elements.find(el => el.querySelector('label')?.textContent?.trim() === text) ?? null;
    return element ? new TestNode(element) : null;
  }

  get nodes(): Array<TestNode> {
    return Array.from(
      this.fixture.nativeElement.querySelectorAll('dd-node') as NodeListOf<HTMLElement>
    ).map(element => new TestNode(element));
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
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    tester = new TestComponentTester();
    await tester.fixture.whenStable();
  });

  test('should create a tree, pre-select nodes, and pre-expand nodes so that selected nodes are visible', () => {
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

  test('should expand and collapse nodes', async () => {
    // collapse B
    tester.node('B')!.expander!.click();
    await tester.fixture.whenStable();
    // expand A
    tester.node('A')!.expander!.click();
    await tester.fixture.whenStable();

    expect(tester.node('A')!.expander!.classList.contains('expanded')).toBe(true);
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A1', 'A2', 'B']);

    tester.node('A2')!.expander!.click();
    await tester.fixture.whenStable();

    expect(tester.node('A2')!.expander!.classList.contains('expanded')).toBe(true);
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A1', 'A2', 'A21', 'A22', 'B']);

    expect(tester.node('A21')!.expander).toBeNull();

    tester.node('A')!.expander!.click();
    await tester.fixture.whenStable();
    expect(tester.node('A')!.expander!.classList.contains('expanded')).toBe(false);
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'B']);

    tester.node('A')!.expander!.click();
    await tester.fixture.whenStable();
    expect(tester.node('A')!.expander!.classList.contains('expanded')).toBe(true);
    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A1', 'A2', 'A21', 'A22', 'B']);
  });

  test('should select and deselect nodes', async () => {
    // expand A
    tester.node('A')!.expander!.click();
    await tester.fixture.whenStable();
    // expand A1
    tester.node('A1')!.expander!.click();
    await tester.fixture.whenStable();
    // check A1
    tester.node('A1')!.checkbox!.click();
    await tester.fixture.whenStable();

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

    tester.node('A11')!.checkbox!.click();
    await tester.fixture.whenStable();
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

  test('should filter nodes and restore their expanded status when unfiltering', async () => {
    tester.node('A')!.expander!.click();
    await tester.fixture.whenStable();

    tester.componentInstance.filter.set('A');
    await tester.fixture.whenStable();

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
    await tester.fixture.whenStable();

    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A2', 'A21', 'A22']);

    tester.componentInstance.filter.set('A22');
    await tester.fixture.whenStable();

    expect(tester.visibleNodes.map(n => n.text)).toEqual(['A', 'A2', 'A22']);

    tester.componentInstance.filter.set('A223');
    await tester.fixture.whenStable();

    expect(tester.visibleNodes.map(n => n.text)).toEqual([]);

    tester.componentInstance.filter.set('');
    await tester.fixture.whenStable();

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

  test('should change the text accessor', async () => {
    tester.componentInstance.textAccessor.set(
      payload => (payload.id.startsWith('a') ? 'z' + payload.id : payload.id) + '!'
    );
    await tester.fixture.whenStable();
    expect(tester.visibleNodes.map(n => n.text)).toEqual([
      'b!',
      'b1!',
      'b11!',
      'b12!',
      'b2!',
      'za!'
    ]);
  });

  test('should honor the node template', async () => {
    tester.node('A')!.expander!.click();
    await tester.fixture.whenStable();
    tester.node('A1')!.expander!.click();
    await tester.fixture.whenStable();
    expect(tester.node('A')!.payload!.textContent!.trim()).toBe('A');
    expect(tester.node('A11')!.payload!.textContent).toContain('A11');
    expect(tester.node('A11')!.payload!.textContent).toContain('foo');
  });

  test('should highlight nodes', async () => {
    tester.node('A')!.expander!.click();
    await tester.fixture.whenStable();
    tester.node('A1')!.expander!.click();
    await tester.fixture.whenStable();
    tester.node('A')!.payload!.click();
    await tester.fixture.whenStable();
    expect(tester.componentInstance.highlightedNode()).toEqual({ text: 'A', payload: { id: 'a' } });

    tester.node('A11')!.payload!.click();
    await tester.fixture.whenStable();
    expect(tester.componentInstance.highlightedNode()).toEqual({
      text: 'A11',
      payload: {
        id: 'a11',
        type: 'foo'
      }
    });
  });
});
