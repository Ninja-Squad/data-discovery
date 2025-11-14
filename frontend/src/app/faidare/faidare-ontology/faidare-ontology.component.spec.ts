import { createMock, RoutingTester } from 'ngx-speculoos';
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
import { provideI18nTesting } from '../../i18n/mock-18n.spec';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { FaidareOntologyComponent } from './faidare-ontology.component';

class OntologyComponentTester extends RoutingTester {
  constructor(harness: RouterTestingHarness) {
    super(harness);
  }

  get treeFilter() {
    return this.input('#tree-filter');
  }

  get language() {
    return this.select('#language');
  }

  get tree() {
    return this.element('dd-tree');
  }

  nodeContaining(text: string) {
    return (
      this.elements<HTMLElement>('.node-payload').find(element =>
        element.textContent.includes(text)
      ) ?? null
    );
  }

  get highlightedNode() {
    return this.tree.element('.highlighted');
  }

  expanderOfNodeContaining(text: string) {
    return (
      this.elements<HTMLElement>('.node')
        .find(element => element.textContent.includes(text))
        ?.element<HTMLElement>('.expand') ?? null
    );
  }

  get nodeDetails() {
    return this.element('dd-node-details');
  }
}

describe('OntologyComponent', () => {
  let ontologyService: jasmine.SpyObj<OntologyService>;
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

    ontologyService.getPreferredLanguage.and.returnValue('FR');

    treeSubject = new Subject<Array<TreeNode<OntologyPayload>>>();
    treeI18nSubject = new Subject<TreeI18n>();

    ontologyService.getCompleteTree.and.returnValue(treeSubject);
    ontologyService.getTreeI18n.and.returnValue(treeI18nSubject);

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

  afterEach(() => jasmine.clock().uninstall());

  it('should display a tree with the default language selected', async () => {
    tester = new OntologyComponentTester(await RouterTestingHarness.create('/ontology'));

    expect(tester.tree).toBeNull();
    expect(tester.nodeDetails).toBeNull();

    treeSubject.next(tree);
    treeI18nSubject.next(treeI18n);

    await tester.stable();

    expect(tester.tree).not.toBeNull();
    expect(tester.treeFilter).toHaveValue('');
    expect(tester.language).toHaveSelectedLabel('Français');
    expect(tester.nodeDetails).toBeNull();

    expect(tester.tree).toContainText('O1');
    expect(tester.tree).toContainText('Ontology');

    expect(tester.tree).not.toContainText('TC1');
    expect(tester.tree).not.toContainText('Trait class');

    expect(tester.tree).not.toContainText('T1');
    expect(tester.tree).not.toContainText('Trait');

    expect(tester.tree).not.toContainText('V1');
    expect(tester.tree).not.toContainText('Variable');

    expect(tester.highlightedNode).toBeNull();

    expect(ontologyService.getTreeI18n).toHaveBeenCalledWith('FR');
  });

  it('should highlight and expand path to node in fragment', async () => {
    ontologyService.getTrait.and.returnValue(
      of({ name: 'T1', synonyms: [], alternativeAbbreviations: [] } as TraitDetails)
    );

    tester = new OntologyComponentTester(await RouterTestingHarness.create('/ontology#t1'));
    treeSubject.next(tree);
    treeI18nSubject.next(treeI18n);

    await tester.stable();

    expect(tester.nodeDetails).toContainText('T1');

    expect(tester.tree).toContainText('O1');
    expect(tester.tree).toContainText('Ontology');

    expect(tester.tree).toContainText('TC1');
    expect(tester.tree).toContainText('Trait class');

    expect(tester.tree).toContainText('T1');
    expect(tester.tree).toContainText('Trait');

    expect(tester.tree).not.toContainText('V1');
    expect(tester.tree).not.toContainText('Variable');

    expect(tester.highlightedNode).toContainText('T1');
  });

  describe('once initialized', () => {
    beforeEach(async () => {
      tester = new OntologyComponentTester(await RouterTestingHarness.create('/ontology'));
      treeSubject.next(tree);
      treeI18nSubject.next(treeI18n);
      await tester.stable();
    });

    it('should filter', async () => {
      jasmine.clock().install();
      jasmine.clock().mockDate();

      await tester.expanderOfNodeContaining('O1').click();
      await tester.expanderOfNodeContaining('TC1').click();
      await tester.expanderOfNodeContaining('T1').click();

      expect(tester.tree).toContainText('TC1');

      await tester.treeFilter.fillWith('TC45');
      // using jasmine clock doesn't work here, but I don't know why
      // since the delay is small, we'll really wait
      jasmine.clock().tick(500);
      await tester.stable();

      expect(tester.tree).not.toContainText('TC1');

      await tester.treeFilter.fillWith('');
      jasmine.clock().tick(500);
      await tester.stable();

      expect(tester.tree).toContainText('TC1');
    });

    it('should highlight ontology node', async () => {
      ontologyService.getOntology.and.returnValue(
        of({ ontologyName: 'O1', links: [] } as OntologyDetails)
      );
      await tester.nodeContaining('O1').click();

      expect(tester.highlightedNode).toContainText('O1');
      expect(tester.nodeDetails).toContainText('O1');
      expect(tester.url).toBe('/ontology#o1');
    });

    it('should highlight trait class node', async () => {
      ontologyService.getTraitClass.and.returnValue(of({ name: 'TC1' } as TraitClassDetails));

      await tester.expanderOfNodeContaining('O1').click();
      await tester.nodeContaining('TC1').click();

      expect(tester.highlightedNode).toContainText('TC1');
      expect(tester.nodeDetails).toContainText('TC1');
      expect(tester.url).toBe('/ontology#tc1');
    });

    it('should highlight trait node', async () => {
      ontologyService.getTrait.and.returnValue(
        of({ name: 'T1', synonyms: [], alternativeAbbreviations: [] } as TraitDetails)
      );
      await tester.expanderOfNodeContaining('O1').click();
      await tester.expanderOfNodeContaining('TC1').click();
      await tester.nodeContaining('T1').click();

      expect(tester.highlightedNode).toContainText('T1');
      expect(tester.nodeDetails).toContainText('T1');
      expect(tester.url).toBe('/ontology#t1');
    });

    it('should highlight variable node', async () => {
      ontologyService.getVariable.and.returnValue(
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

      expect(tester.highlightedNode).toContainText('V2');
      expect(tester.nodeDetails).toContainText('V2');
      expect(tester.url).toBe('/ontology#v2');
    });

    it('should change the language', async () => {
      ontologyService.getOntology.and.returnValue(
        of({ ontologyName: 'O1', links: [] } as OntologyDetails)
      );
      await tester.nodeContaining('O1').click();

      ontologyService.getTreeI18n.and.returnValue(
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
      ontologyService.getOntology.and.returnValue(
        of({ ontologyName: 'Ola O1', links: [] } as OntologyDetails)
      );

      await tester.language?.selectLabel('Español');
      expect(tester.tree).toContainText('Ola O1');
      expect(tester.nodeDetails).toContainText('Ola O1');
    });
  });
});
