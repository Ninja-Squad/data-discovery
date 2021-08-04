import { TestBed } from '@angular/core/testing';

import { OntologyService } from './ontology.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TreeNode } from './faidare/tree/tree.service';

describe('OntologyService', () => {
  let service: OntologyService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(OntologyService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should get tree', () => {
    let tree: Array<TreeNode> = [];
    service.getTree().subscribe(t => (tree = t));

    http.expectOne('api/ontologies').flush([
      {
        payload: {
          type: 'ONTOLOGY',
          name: 'O1'
        },
        children: [
          {
            payload: {
              type: 'TRAIT_CLASS',
              name: 'TC1'
            }
          }
        ]
      }
    ]);

    expect(tree).toEqual([
      {
        text: 'O1',
        payload: {
          type: 'ONTOLOGY',
          name: 'O1'
        },
        children: [
          {
            text: 'TC1',
            payload: {
              type: 'TRAIT_CLASS',
              name: 'TC1'
            },
            children: []
          }
        ]
      }
    ]);
  });
});
