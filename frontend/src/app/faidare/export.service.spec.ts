import { TestBed } from '@angular/core/testing';

import { ExportService } from './export.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ExportService', () => {
  let service: ExportService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(ExportService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should export', () => {
    let actualResults: Blob;
    service
      .export('Bacteria', [{ name: 'entry', values: ['Germplasm'] }], true)
      .subscribe(blob => (actualResults = blob));

    const expectedResults = new Blob();
    http
      .expectOne('api/germplasms/export?query=Bacteria&descendants=true&entry=Germplasm')
      .flush(expectedResults);
    expect(actualResults).toBe(expectedResults);
  });
});
