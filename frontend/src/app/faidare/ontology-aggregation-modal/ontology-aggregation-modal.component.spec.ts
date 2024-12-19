import { OntologyAggregationModalComponent } from './ontology-aggregation-modal.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
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
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

class OntologyAggregationModalComponentTester extends ComponentTester<OntologyAggregationModalComponent> {
  constructor() {
    super(OntologyAggregationModalComponent);
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

  nodeCheckboxContaining(text: string) {
    return (
      this.elements('dd-node')
        .find(element => element.element('.node-payload').textContent.includes(text))
        ?.input('input') ?? null
    );
  }

  get nodeDetails() {
    return this.element('dd-node-details');
  }

  get limitSelection() {
    return this.element('#limit-selection');
  }

  get ok() {
    return this.button('#ok-button');
  }

  get cancel() {
    return this.button('#cancel-button');
  }
}

describe('OntologyAggregationModalComponent', () => {
  let activeModal: jasmine.SpyObj<NgbActiveModal>;
  let ontologyService: jasmine.SpyObj<OntologyService>;
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

    ontologyService.getPreferredLanguage.and.returnValue('FR');

    treeSubject = new Subject<Array<TreeNode<OntologyPayload>>>();
    treeI18nSubject = new Subject<TreeI18n>();

    ontologyService.getTree.and.returnValue(treeSubject);
    ontologyService.getTreeI18n.and.returnValue(treeI18nSubject);

    tester = new OntologyAggregationModalComponentTester();
    tester.componentInstance.prepare(toAggregation('o', ['v1', 'v2', 'v3']), ['v2']);
    await tester.stable();

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

  afterEach(() => jasmine.clock().uninstall());

  it('should display a tree with the default language selected', async () => {
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

    expect(tester.tree).toContainText('TC1');
    expect(tester.tree).toContainText('Trait class');

    expect(tester.tree).toContainText('T1');
    expect(tester.tree).toContainText('Trait');

    expect(tester.tree).toContainText('V1');
    expect(tester.tree).toContainText('Variable');

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
      await tester.stable();
    });

    it('should filter', async () => {
      jasmine.clock().install();
      jasmine.clock().mockDate();

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
      await tester.fixture.whenRenderingDone();

      expect(tester.tree).toContainText('TC1');
    });

    it('should highlight ontology node', async () => {
      ontologyService.getOntology.and.returnValue(
        of({ ontologyName: 'O1', links: [] } as OntologyDetails)
      );
      await tester.nodeContaining('O1').click();

      expect(tester.nodeDetails).toContainText('O1');
    });

    it('should highlight trait class node', async () => {
      ontologyService.getTraitClass.and.returnValue(of({ name: 'TC1' } as TraitClassDetails));
      await tester.nodeContaining('TC1').click();

      expect(tester.nodeDetails).toContainText('TC1');
    });

    it('should highlight trait node', async () => {
      ontologyService.getTrait.and.returnValue(
        of({ name: 'T1', synonyms: [], alternativeAbbreviations: [] } as TraitDetails)
      );
      await tester.nodeContaining('T1').click();

      expect(tester.nodeDetails).toContainText('T1');
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
      await tester.nodeContaining('V2').click();

      expect(tester.nodeDetails).toContainText('V2');
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

    it('should cancel', async () => {
      await tester.cancel.click();
      expect(activeModal.dismiss).toHaveBeenCalled();
    });

    it('should display an error and disable close if more than max selected', async () => {
      tester.componentInstance.maxSelectedNodes = 2;
      await tester.stable();
      expect(tester.limitSelection).toBeNull();
      expect(tester.ok.disabled).toBeFalse();

      await tester.nodeCheckboxContaining('V1').check();
      expect(tester.limitSelection).toBeNull();
      expect(tester.ok.disabled).toBeFalse();

      await tester.nodeCheckboxContaining('V3').check();
      expect(tester.limitSelection).not.toBeNull();
      expect(tester.ok.disabled).toBeTrue();
      expect(tester.limitSelection).toContainText(
        '3 variables selected. Please limit the selection to max 2.'
      );

      await tester.nodeCheckboxContaining('V2').uncheck();
      expect(tester.limitSelection).toBeNull();
      expect(tester.ok.disabled).toBeFalse();
    });

    it('should close', async () => {
      await tester.nodeCheckboxContaining('V1').check();
      await tester.nodeCheckboxContaining('V2').uncheck();
      await tester.nodeCheckboxContaining('V3').check();
      await tester.ok.click();
      expect(activeModal.close).toHaveBeenCalledWith(['v1', 'v3']);
    });
  });
});
