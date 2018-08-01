import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PillarService } from './pillar.service';
import { PillarModel } from './models/pillar.model';

describe('PillarService', () => {
  let service: PillarService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });

    service = TestBed.get(PillarService) as PillarService;
    http = TestBed.get(HttpTestingController) as HttpTestingController;
  });

  it('should list pillars', () => {
    let actualResults: Array<PillarModel>;
    service.list().subscribe(results => actualResults = results);

    const expectedResults = [
      {
        name: 'Plant'
      }
    ] as Array<PillarModel>;

    http.expectOne('/api/pillars').flush(expectedResults);
    expect(actualResults).toEqual(expectedResults);

    http.verify();
  });
});
