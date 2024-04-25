import { OntologyAggregationModalComponent } from './ontology-aggregation-modal.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
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

  beforeEach(() => {
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
    tester.detectChanges();

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

  it('should display a tree with the default language selected', () => {
    expect(tester.tree).toBeNull();
    expect(tester.nodeDetails).toBeNull();

    treeSubject.next(tree);
    treeI18nSubject.next(treeI18n);

    tester.detectChanges();

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
    beforeEach(() => {
      treeSubject.next(tree);
      treeI18nSubject.next(treeI18n);
      tester.detectChanges();
    });

    it('should filter', fakeAsync(() => {
      tester.treeFilter.fillWith('TC45');
      tick(500);
      tester.detectChanges();

      expect(tester.tree).not.toContainText('TC1');

      tester.treeFilter.fillWith('');
      tick(500);
      tester.detectChanges();

      expect(tester.tree).toContainText('TC1');
    }));

    it('should highlight ontology node', fakeAsync(() => {
      ontologyService.getOntology.and.returnValue(
        of({ ontologyName: 'O1', links: [] } as OntologyDetails)
      );
      tester.nodeContaining('O1').click();

      expect(tester.nodeDetails).toContainText('O1');
    }));

    it('should highlight trait class node', fakeAsync(() => {
      ontologyService.getTraitClass.and.returnValue(of({ name: 'TC1' } as TraitClassDetails));
      tester.nodeContaining('TC1').click();

      expect(tester.nodeDetails).toContainText('TC1');
    }));

    it('should highlight trait node', fakeAsync(() => {
      ontologyService.getTrait.and.returnValue(
        of({ name: 'T1', synonyms: [], alternativeAbbreviations: [] } as TraitDetails)
      );
      tester.nodeContaining('T1').click();

      expect(tester.nodeDetails).toContainText('T1');
    }));

    it('should highlight variable node', fakeAsync(() => {
      ontologyService.getVariable.and.returnValue(
        of({
          name: 'V2',
          synonyms: [],
          contextOfUse: [],
          trait: { name: 'T1', synonyms: [], alternativeAbbreviations: [] }
        } as VariableDetails)
      );
      tester.nodeContaining('V2').click();

      expect(tester.nodeDetails).toContainText('V2');
    }));

    it('should change the language', fakeAsync(() => {
      ontologyService.getOntology.and.returnValue(
        of({ ontologyName: 'O1', links: [] } as OntologyDetails)
      );
      tester.nodeContaining('O1').click();

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

      tester.language?.selectLabel('Español');
      expect(tester.tree).toContainText('Ola O1');
      expect(tester.nodeDetails).toContainText('Ola O1');
    }));

    it('should cancel', () => {
      tester.cancel.click();
      expect(activeModal.dismiss).toHaveBeenCalled();
    });

    it('should display an error and disable close if more than max selected', () => {
      tester.componentInstance.maxSelectedNodes = 2;
      tester.detectChanges();
      expect(tester.limitSelection).toBeNull();
      expect(tester.ok.disabled).toBeFalse();

      tester.nodeCheckboxContaining('V1').check();
      expect(tester.limitSelection).toBeNull();
      expect(tester.ok.disabled).toBeFalse();

      tester.nodeCheckboxContaining('V3').check();
      expect(tester.limitSelection).not.toBeNull();
      expect(tester.ok.disabled).toBeTrue();
      expect(tester.limitSelection).toContainText(
        '3 variables selected. Please limit the selection to max 2.'
      );

      tester.nodeCheckboxContaining('V2').uncheck();
      expect(tester.limitSelection).toBeNull();
      expect(tester.ok.disabled).toBeFalse();
    });

    it('should close', () => {
      tester.nodeCheckboxContaining('V1').check();
      tester.nodeCheckboxContaining('V2').uncheck();
      tester.nodeCheckboxContaining('V3').check();
      tester.ok.click();
      expect(activeModal.close).toHaveBeenCalledWith(['v1', 'v3']);
    });
  });
});
