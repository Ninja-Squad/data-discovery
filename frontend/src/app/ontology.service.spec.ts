import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import { OntologyPayload, OntologyService } from './ontology.service';
import { TreeNode } from './faidare/tree/tree.service';
import { provideI18nTesting } from './i18n/mock-18n';

describe('OntologyService', () => {
  let service: OntologyService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideI18nTesting()]
    });
    service = TestBed.inject(OntologyService);
    http = TestBed.inject(HttpTestingController);
  });

  test('should get tree', () => {
    let tree: Array<TreeNode<OntologyPayload>> = [];
    service
      .getTree({ selectableVariableIds: ['V1', 'V2'], selectedVariableIds: ['V2'] })
      .subscribe(t => (tree = t));

    http.expectOne('api/ontologies').flush([
      {
        payload: {
          type: 'ONTOLOGY',
          id: 'O1'
        },
        children: [
          {
            payload: {
              type: 'TRAIT_CLASS',
              id: 'TC1'
            },
            children: [
              {
                payload: {
                  type: 'TRAIT',
                  id: 'T1'
                },
                children: [
                  {
                    payload: {
                      type: 'VARIABLE',
                      id: 'V1'
                    }
                  }
                ]
              }
            ]
          },
          {
            payload: {
              type: 'TRAIT_CLASS',
              id: 'TC2'
            },
            children: [
              {
                payload: {
                  type: 'TRAIT',
                  id: 'T2'
                },
                children: [
                  {
                    payload: {
                      type: 'VARIABLE',
                      id: 'V2'
                    }
                  },
                  {
                    payload: {
                      type: 'VARIABLE',
                      id: 'V3'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);

    expect(tree).toEqual([
      {
        payload: {
          type: 'ONTOLOGY',
          id: 'O1'
        },
        children: [
          {
            payload: {
              type: 'TRAIT_CLASS',
              id: 'TC1'
            },
            children: [
              {
                payload: {
                  type: 'TRAIT',
                  id: 'T1'
                },
                children: [
                  {
                    payload: {
                      type: 'VARIABLE',
                      id: 'V1'
                    },
                    children: [],
                    selected: false
                  }
                ]
              }
            ]
          },
          {
            payload: {
              type: 'TRAIT_CLASS',
              id: 'TC2'
            },
            children: [
              {
                payload: {
                  type: 'TRAIT',
                  id: 'T2'
                },
                children: [
                  {
                    payload: {
                      type: 'VARIABLE',
                      id: 'V2'
                    },
                    children: [],
                    selected: true
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);
  });
});
