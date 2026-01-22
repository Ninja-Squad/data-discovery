import { OntologyAggregationModalComponent } from './ontology-aggregation-modal.component';
import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createMock, MockObject } from '../../../test/mock';
import { TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  OntologyDetails,
  OntologyPayload,
  OntologyService,
  TraitClassDetails,
  TraitDetails,
  TreeI18n,
  VariableDetails
} from '../../ontology.service';
import { toAggregation } from '../../models/test-model-generators';
import { of, Subject } from 'rxjs';
import { TreeNode } from '../tree/tree.service';
import { provideI18nTesting } from '../../i18n/mock-18n';

class OntologyAggregationModalComponentTester {
  readonly fixture = TestBed.createComponent(OntologyAggregationModalComponent);
  readonly componentInstance = this.fixture.componentInstance;

  readonly treeFilter = page.getByCss('#tree-filter');
  readonly language = page.getByCss('#language');
  readonly tree = page.getByCss('dd-tree');
  readonly nodeDetails = page.getByCss('dd-node-details');
  readonly limitSelection = page.getByCss('#limit-selection');
  readonly ok = page.getByCss('#ok-button');
  readonly cancel = page.getByCss('#cancel-button');

  nodeContaining(text: string): HTMLElement | null {
    return (
      Array.from(
        this.fixture.nativeElement.querySelectorAll('.node-payload') as NodeListOf<HTMLElement>
      ).find(element => element.textContent?.includes(text)) ?? null
    );
  }

  nodeCheckboxContaining(text: string): HTMLInputElement | null {
    const nodeElements = Array.from(
      this.fixture.nativeElement.querySelectorAll('dd-node') as NodeListOf<HTMLElement>
    );
    for (const nodeElement of nodeElements) {
      const payloadElement = nodeElement.querySelector('.node-payload');
      if (payloadElement?.textContent?.includes(text)) {
        return nodeElement.querySelector('input');
      }
    }
    return null;
  }
}

describe('OntologyAggregationModalComponent', () => {
  let activeModal: MockObject<NgbActiveModal>;
  let ontologyService: MockObject<OntologyService>;
  let tester: OntologyAggregationModalComponentTester;
  let treeSubject: Subject<Array<TreeNode<OntologyPayload>>>;
  let treeI18nSubject: Subject<TreeI18n>;
  let tree: Array<TreeNode<OntologyPayload>>;
  let treeI18n: TreeI18n;

  beforeEach(async () => {
    activeModal = createMock(NgbActiveModal);
    ontologyService = createMock(OntologyService);

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        { provide: NgbActiveModal, useValue: activeModal },
        { provide: OntologyService, useValue: ontologyService }
      ]
    });

    ontologyService.getPreferredLanguage.mockReturnValue('FR');

    treeSubject = new Subject<Array<TreeNode<OntologyPayload>>>();
    treeI18nSubject = new Subject<TreeI18n>();

    ontologyService.getTree.mockReturnValue(treeSubject);
    ontologyService.getTreeI18n.mockReturnValue(treeI18nSubject);

    tester = new OntologyAggregationModalComponentTester();
    tester.componentInstance.prepare(toAggregation('o', ['v1', 'v2', 'v3']), ['v2']);

    tree = [
      {
        payload: {
          type: 'ONTOLOGY',
          id: 'o1'
        },
        children: [
          {
            payload: {
              type: 'TRAIT_CLASS',
              id: 'tc1'
            },
            children: [
              {
                payload: {
                  type: 'TRAIT',
                  id: 't1'
                },
                children: [
                  {
                    payload: {
                      type: 'VARIABLE',
                      id: 'v1'
                    },
                    children: []
                  },
                  {
                    payload: {
                      type: 'VARIABLE',
                      id: 'v2'
                    },
                    selected: true,
                    children: []
                  },
                  {
                    payload: {
                      type: 'VARIABLE',
                      id: 'v3'
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    treeI18n = {
      language: 'FR',
      names: {
        ONTOLOGY: {
          o1: 'O1'
        },
        TRAIT_CLASS: {
          tc1: 'TC1'
        },
        TRAIT: {
          t1: 'T1'
        },
        VARIABLE: {
          v1: 'V1',
          v2: 'V2',
          v3: 'V3'
        }
      }
    };
  });

  afterEach(() => vi.useRealTimers());

  test('should display a tree with the default language selected', async () => {
    await expect.element(tester.tree).not.toBeInTheDocument();
    await expect.element(tester.nodeDetails).not.toBeInTheDocument();

    treeSubject.next(tree);
    treeI18nSubject.next(treeI18n);

    await expect.element(tester.tree).toBeInTheDocument();
    await expect.element(tester.treeFilter).toHaveValue('');
    await expect.element(tester.language).toHaveDisplayValue('Français');
    await expect.element(tester.nodeDetails).not.toBeInTheDocument();

    await expect.element(tester.tree).toHaveTextContent('O1');
    await expect.element(tester.tree).toHaveTextContent('Ontology');

    await expect.element(tester.tree).toHaveTextContent('TC1');
    await expect.element(tester.tree).toHaveTextContent('Trait class');

    await expect.element(tester.tree).toHaveTextContent('T1');
    await expect.element(tester.tree).toHaveTextContent('Trait');

    await expect.element(tester.tree).toHaveTextContent('V1');
    await expect.element(tester.tree).toHaveTextContent('Variable');

    expect(ontologyService.getTree).toHaveBeenCalledWith({
      selectableVariableIds: ['v1', 'v2', 'v3'],
      selectedVariableIds: ['v2']
    });
    expect(ontologyService.getTreeI18n).toHaveBeenCalledWith('FR');
  });

  describe('once initialized', () => {
    beforeEach(async () => {
      treeSubject.next(tree);
      treeI18nSubject.next(treeI18n);
      await tester.fixture.whenStable();
    });

    test('should filter', async () => {
      await expect.element(tester.tree).toHaveTextContent('TC1');

      await tester.treeFilter.fill('TC45');

      await expect.element(tester.tree).not.toHaveTextContent('TC1');

      await tester.treeFilter.fill('');

      await expect.element(tester.tree).toHaveTextContent('TC1');
    });

    test('should highlight ontology node', async () => {
      ontologyService.getOntology.mockReturnValue(
        of({ ontologyName: 'O1', links: [] } as OntologyDetails)
      );
      tester.nodeContaining('O1')!.click();

      await expect.element(tester.nodeDetails).toHaveTextContent('O1');
    });

    test('should highlight trait class node', async () => {
      ontologyService.getTraitClass.mockReturnValue(of({ name: 'TC1' } as TraitClassDetails));
      tester.nodeContaining('TC1')!.click();

      await expect.element(tester.nodeDetails).toHaveTextContent('TC1');
    });

    test('should highlight trait node', async () => {
      ontologyService.getTrait.mockReturnValue(
        of({ name: 'T1', synonyms: [], alternativeAbbreviations: [] } as TraitDetails)
      );
      tester.nodeContaining('T1')!.click();

      await expect.element(tester.nodeDetails).toHaveTextContent('T1');
    });

    test('should highlight variable node', async () => {
      ontologyService.getVariable.mockReturnValue(
        of({
          name: 'V2',
          synonyms: [],
          contextOfUse: [],
          trait: { name: 'T1', synonyms: [], alternativeAbbreviations: [] }
        } as VariableDetails)
      );
      tester.nodeContaining('V2')!.click();

      await expect.element(tester.nodeDetails).toHaveTextContent('V2');
    });

    test('should change the language', async () => {
      ontologyService.getOntology.mockReturnValue(
        of({ ontologyName: 'O1', links: [] } as OntologyDetails)
      );
      tester.nodeContaining('O1')!.click();

      ontologyService.getTreeI18n.mockReturnValue(
        of({
          language: 'ES',
          names: {
            ONTOLOGY: {
              o1: 'Ola O1'
            },
            TRAIT_CLASS: {
              tc1: 'TC1'
            },
            TRAIT: {
              t1: 'T1'
            },
            VARIABLE: {
              v1: 'V1',
              v2: 'V2',
              v3: 'V3'
            }
          }
        })
      );
      ontologyService.getOntology.mockReturnValue(
        of({ ontologyName: 'Ola O1', links: [] } as OntologyDetails)
      );

      const select = tester.language.element() as HTMLSelectElement;
      const option = Array.from(select.options).find(opt => opt.textContent === 'Español');
      if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change'));
      }

      await expect.element(tester.tree).toHaveTextContent('Ola O1');
      await expect.element(tester.nodeDetails).toHaveTextContent('Ola O1');
    });

    test('should cancel', async () => {
      await tester.cancel.click();
      expect(activeModal.dismiss).toHaveBeenCalled();
    });

    test('should display an error and disable close if more than max selected', async () => {
      tester.componentInstance.maxSelectedNodes = 2;
      await expect.element(tester.limitSelection).not.toBeInTheDocument();
      await expect.element(tester.ok).not.toBeDisabled();

      tester.nodeCheckboxContaining('V1')!.click();
      await tester.fixture.whenStable();
      await expect.element(tester.limitSelection).not.toBeInTheDocument();
      await expect.element(tester.ok).not.toBeDisabled();

      tester.nodeCheckboxContaining('V3')!.click();
      await tester.fixture.whenStable();
      await expect.element(tester.limitSelection).toBeInTheDocument();
      await expect.element(tester.ok).toBeDisabled();
      await expect
        .element(tester.limitSelection)
        .toHaveTextContent('3 variables selected. Please limit the selection to max 2.');

      tester.nodeCheckboxContaining('V2')!.click();
      await tester.fixture.whenStable();
      await expect.element(tester.limitSelection).not.toBeInTheDocument();
      await expect.element(tester.ok).not.toBeDisabled();
    });

    test('should close', async () => {
      tester.nodeCheckboxContaining('V1')!.click();
      await tester.fixture.whenStable();
      tester.nodeCheckboxContaining('V2')!.click();
      await tester.fixture.whenStable();
      tester.nodeCheckboxContaining('V3')!.click();
      await tester.fixture.whenStable();
      await tester.ok.click();
      expect(activeModal.close).toHaveBeenCalledWith(['v1', 'v3']);
    });
  });
});
