import { TestBed } from '@angular/core/testing';

import { ExportService } from './export.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('ExportService', () => {
  let service: ExportService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ExportService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should export', () => {
    let actualResults: Blob;
    service
      .export(
        {
          query: 'Bacteria',
          aggregationCriteria: [{ name: 'entry', values: ['Germplasm'] }],
          descendants: true
        },
        'mcpd'
      )
      .subscribe(blob => (actualResults = blob));

    const expectedResults = new Blob();
    http
      .expectOne('api/germplasms/exports/mcpd?query=Bacteria&descendants=true&entry=Germplasm')
      .flush(expectedResults);
    expect(actualResults).toBe(expectedResults);
  });
});
