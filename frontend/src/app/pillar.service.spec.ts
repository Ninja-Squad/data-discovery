import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';
import { PillarModel } from './models/pillar.model';
import { PillarService } from './pillar.service';

describe('PillarService', () => {
  let service: PillarService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClientTesting()]
    });

    service = TestBed.inject(PillarService);
    http = TestBed.inject(HttpTestingController);
  });

  test('should list pillars', () => {
    let actualResults: Array<PillarModel>;
    service.list().subscribe(results => (actualResults = results));

    const expectedResults = [
      {
        name: 'Plant'
      }
    ] as Array<PillarModel>;

    http.expectOne('api/pillars').flush(expectedResults);
    expect(actualResults!).toEqual(expectedResults);

    http.verify();
  });
});
