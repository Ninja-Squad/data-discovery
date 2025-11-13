import { TestBed } from '@angular/core/testing';

import { ExportService } from './export.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('ExportService', () => {
  let service: ExportService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()]
    });

    service = TestBed.inject(ExportService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should export CSV', () => {
    let actualBlob: Blob;
    service
      .export(
        {
          query: 'Bacteria',
          aggregationCriteria: [{ name: 'entry', values: ['Germplasm'] }],
          descendants: true
        },
        'mcpd'
      )
      .subscribe(result => (actualBlob = result));

    const expectedBlob = new Blob();
    http
      .expectOne('api/germplasms/exports/mcpd?query=Bacteria&descendants=true&entry=Germplasm')
      .flush(expectedBlob, { headers: { 'Content-Type': 'text/csv' } });
    expect(actualBlob).toBe(expectedBlob);
  });

  it('should export Excel', () => {
    let actualBlob: Blob | undefined;
    service
      .export(
        {
          query: 'Bacteria',
          aggregationCriteria: [{ name: 'entry', values: ['Germplasm'] }],
          descendants: true
        },
        'miappe-excel'
      )
      .subscribe(result => (actualBlob = result));

    const expectedBlob = new Blob();
    http
      .expectOne(
        'api/germplasms/exports/miappe?query=Bacteria&descendants=true&entry=Germplasm&format=EXCEL'
      )
      .flush(expectedBlob, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet'
        }
      });
    expect(actualBlob).toBe(expectedBlob);
  });
});
