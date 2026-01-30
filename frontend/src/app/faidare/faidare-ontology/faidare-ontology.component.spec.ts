import { TestBed } from '@angular/core/testing';
import {
  OntologyDetails,
  OntologyPayload,
  OntologyService,
  TraitClassDetails,
  TraitDetails,
  TreeI18n,
  VariableDetails
} from '../../ontology.service';
import { of, Subject } from 'rxjs';
import { TreeNode } from '../tree/tree.service';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter, Router } from '@angular/router';
import { FaidareOntologyComponent } from './faidare-ontology.component';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';
import { createMock, MockObject } from '../../../test/mock';

class OntologyComponentTester {
  readonly treeFilter = page.getByCss('#tree-filter');
  readonly language = page.getByCss('#language');
  readonly tree = page.getByCss('dd-tree');
  readonly highlightedNode = page.getByCss('.highlighted');
  readonly nodeDetails = page.getByCss('dd-node-details');

  constructor(readonly harness: RouterTestingHarness) {}

  expanderOfNodeContaining(text: string) {
    return page.getByRole('button', { name: `Expand ${text}` });
  }

  nodeContaining(text: string) {
    return page.getByCss('.node-payload').and(page.getByText(text));
  }
}

describe('OntologyComponent', () => {
  let ontologyService: MockObject<OntologyService>;
  let tester: OntologyComponentTester;

  let treeSubject: Subject<Array<TreeNode<OntologyPayload>>>;
  let treeI18nSubject: Subject<TreeI18n>;

  let tree: Array<TreeNode<OntologyPayload>>;
  let treeI18n: TreeI18n;

  beforeEach(async () => {
    ontologyService = createMock(OntologyService);

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        provideRouter([{ path: 'ontology', component: FaidareOntologyComponent }]),
        { provide: OntologyService, useValue: ontologyService }
      ]
    });

    ontologyService.getPreferredLanguage.mockReturnValue('FR');

    treeSubject = new Subject<Array<TreeNode<OntologyPayload>>>();
    treeI18nSubject = new Subject<TreeI18n>();

    ontologyService.getCompleteTree.mockReturnValue(treeSubject);
    ontologyService.getTreeI18n.mockReturnValue(treeI18nSubject);

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

  test('should display a tree with the default language selected', async () => {
    tester = new OntologyComponentTester(await RouterTestingHarness.create('/ontology'));

    await expect.element(tester.tree).not.toBeInTheDocument();
    await expect.element(tester.nodeDetails).not.toBeInTheDocument();

    treeSubject.next(tree);
    treeI18nSubject.next(treeI18n);

    await expect.element(tester.tree).toBeVisible();
    await expect.element(tester.treeFilter).toHaveDisplayValue('');
    await expect.element(tester.language).toHaveDisplayValue('Français');
    await expect.element(tester.nodeDetails).not.toBeInTheDocument();

    await expect.element(tester.tree).toHaveTextContent('O1');
    await expect.element(tester.tree).toHaveTextContent('Ontology');

    await expect.element(tester.tree).not.toHaveTextContent('TC1');
    await expect.element(tester.tree).not.toHaveTextContent('Trait class');

    await expect.element(tester.tree).not.toHaveTextContent('T1');
    await expect.element(tester.tree).not.toHaveTextContent('Trait');

    await expect.element(tester.tree).not.toHaveTextContent('V1');
    await expect.element(tester.tree).not.toHaveTextContent('Variable');

    await expect.element(tester.highlightedNode).not.toBeInTheDocument();

    expect(ontologyService.getTreeI18n).toHaveBeenCalledWith('FR');
  });

  test('should highlight and expand path to node in fragment', async () => {
    ontologyService.getTrait.mockReturnValue(
      of({ name: 'T1', synonyms: [], alternativeAbbreviations: [] } as TraitDetails)
    );

    tester = new OntologyComponentTester(await RouterTestingHarness.create('/ontology#t1'));
    treeSubject.next(tree);
    treeI18nSubject.next(treeI18n);

    await expect.element(tester.nodeDetails).toHaveTextContent('T1');

    await expect.element(tester.tree).toHaveTextContent('O1');
    await expect.element(tester.tree).toHaveTextContent('Ontology');

    await expect.element(tester.tree).toHaveTextContent('TC1');
    await expect.element(tester.tree).toHaveTextContent('Trait class');

    await expect.element(tester.tree).toHaveTextContent('T1');
    await expect.element(tester.tree).toHaveTextContent('Trait');

    await expect.element(tester.tree).not.toHaveTextContent('V1');
    await expect.element(tester.tree).not.toHaveTextContent('Variable');

    await expect.element(tester.highlightedNode).toHaveTextContent('T1');
  });

  describe('once initialized', () => {
    beforeEach(async () => {
      tester = new OntologyComponentTester(await RouterTestingHarness.create('/ontology'));
      treeSubject.next(tree);
      treeI18nSubject.next(treeI18n);
      // eslint-disable-next-line vitest/no-standalone-expect
      await expect.element(tester.tree).toBeVisible();
    });

    test('should filter', async () => {
      await tester.expanderOfNodeContaining('O1').click();
      await tester.expanderOfNodeContaining('TC1').click();
      await tester.expanderOfNodeContaining('T1').click();

      await expect.element(tester.tree).toHaveTextContent('TC1');

      await tester.treeFilter.fill('TC45');

      await expect.element(tester.tree).not.toHaveTextContent('TC1');

      await tester.treeFilter.fill('');

      await expect.element(tester.tree).not.toHaveTextContent('TC1');
    });

    test('should highlight ontology node', async () => {
      ontologyService.getOntology.mockReturnValue(
        of({ ontologyName: 'O1', links: [] } as OntologyDetails)
      );
      await tester.nodeContaining('O1').click();

      await expect.element(tester.highlightedNode).toHaveTextContent('O1');
      await expect.element(tester.nodeDetails).toHaveTextContent('O1');
      expect(TestBed.inject(Router).url).toBe('/ontology#o1');
    });

    test('should highlight trait class node', async () => {
      ontologyService.getTraitClass.mockReturnValue(of({ name: 'TC1' } as TraitClassDetails));

      await tester.expanderOfNodeContaining('O1').click();
      await tester.nodeContaining('TC1').click();

      await expect.element(tester.highlightedNode).toHaveTextContent('TC1');
      await expect.element(tester.nodeDetails).toHaveTextContent('TC1');
      expect(TestBed.inject(Router).url).toBe('/ontology#tc1');
    });

    test('should highlight trait node', async () => {
      ontologyService.getTrait.mockReturnValue(
        of({ name: 'T1', synonyms: [], alternativeAbbreviations: [] } as TraitDetails)
      );
      await tester.expanderOfNodeContaining('O1').click();
      await tester.expanderOfNodeContaining('TC1').click();
      await tester.nodeContaining('T1').click();

      await expect.element(tester.highlightedNode).toHaveTextContent('T1');
      await expect.element(tester.nodeDetails).toHaveTextContent('T1');
      expect(TestBed.inject(Router).url).toBe('/ontology#t1');
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
      await tester.expanderOfNodeContaining('O1').click();
      await tester.expanderOfNodeContaining('TC1').click();
      await tester.expanderOfNodeContaining('T1').click();
      await tester.nodeContaining('V2').click();

      await expect.element(tester.highlightedNode).toHaveTextContent('V2');
      await expect.element(tester.nodeDetails).toHaveTextContent('V2');
      expect(TestBed.inject(Router).url).toBe('/ontology#v2');
    });

    test('should change the language', async () => {
      ontologyService.getOntology.mockReturnValue(
        of({ ontologyName: 'O1', links: [] } as OntologyDetails)
      );
      await tester.nodeContaining('O1').click();

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

      await tester.language.selectOptions('Español');
      await expect.element(tester.tree).toHaveTextContent('Ola O1');
      await expect(tester.nodeDetails).toHaveTextContent('Ola O1');
    });
  });
});
