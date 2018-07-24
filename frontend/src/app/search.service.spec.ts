import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { toGeneticResource, toSinglePage } from './models/test-model-generators';
import { SearchService } from './search.service';
import { Page } from './models/page';
import { GeneticResourceModel } from './models/genetic-resource.model';

describe('SearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule]
  }));

  it('should search for the query', () => {
    const service = TestBed.get(SearchService) as SearchService;
    let actualResults: Page<GeneticResourceModel>;
    service.search('Bacteria')
      .subscribe(results => actualResults = results);

    const resource = toGeneticResource('Bacteria');
    const expectedResults = toSinglePage([resource]);

    const http = TestBed.get(HttpTestingController) as HttpTestingController;
    http.expectOne('/api/genetic-resources?query=Bacteria').flush(expectedResults);
    expect(actualResults).toEqual(expectedResults);

    http.verify();
  });
});
