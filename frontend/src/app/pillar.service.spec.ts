import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { PillarService } from './pillar.service';
import { PillarModel } from './models/pillar.model';
import { provideHttpClient } from '@angular/common/http';

describe('PillarService', () => {
  let service: PillarService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(PillarService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should list pillars', () => {
    let actualResults: Array<PillarModel>;
    service.list().subscribe(results => (actualResults = results));

    const expectedResults = [
      {
        name: 'Plant'
      }
    ] as Array<PillarModel>;

    http.expectOne('api/pillars').flush(expectedResults);
    expect(actualResults).toEqual(expectedResults);

    http.verify();
  });
});
