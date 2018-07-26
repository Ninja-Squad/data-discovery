import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Subject } from 'rxjs';

import { toGeneticResource, toSinglePage } from './models/test-model-generators';
import { SearchService } from './search.service';
import { Page } from './models/page';
import { GeneticResourceModel } from './models/genetic-resource.model';

describe('SearchService', () => {
  let service: SearchService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.get(SearchService) as SearchService;
    http = TestBed.get(HttpTestingController) as HttpTestingController;
  });

  it('should search for the query', () => {
    let actualResults: Page<GeneticResourceModel>;
    service.search('Bacteria', 2)
      .subscribe(results => actualResults = results);

    const resource = toGeneticResource('Bacteria');
    const expectedResults = toSinglePage([resource]);

    http.expectOne('/api/genetic-resources?query=Bacteria&page=1').flush(expectedResults);
    expect(actualResults).toEqual(expectedResults);

    http.verify();
  });

  it('should have a typeahead that suggests if text longer than 1, after 300 ms and only if changed', fakeAsync(() => {
    const typeahead = service.getSuggesterTypeahead();

    const entered = new Subject<string>();
    const results: Array<Array<string>> = [];
    typeahead(entered).subscribe(result => results.push(result));

    // simulate what is entered, character by character, after a delay between each one
    entered.next(' ');
    tick(100);
    entered.next(' v');
    tick(300); // should not trigger a search, but emit an empty array because input is too short
    entered.next(' vi');
    tick(100);
    entered.next(' vit');
    tick(100);
    entered.next(' vit');
    tick(100);
    entered.next(' vit ');
    tick(300); // should finally trigger a search for 'vit'

    const vitResult = ['vitis', 'vitis vinifera'];
    http.expectOne('/api/genetic-resources-suggestions?query=vit').flush(vitResult);

    entered.next(' viti ');
    tick(100);
    entered.next(' viti');
    tick(100);
    entered.next(' vit');
    tick(300); // should not trigger a second search since same value

    entered.next(' viti');
    tick(100);
    entered.next(' vitis');
    tick(100);
    entered.next(' vitis ');
    tick(100);
    entered.next(' vitis v');
    tick(300); // should trigger a second search

    const vitisVResult = ['vitis vinifera'];
    http.expectOne('/api/genetic-resources-suggestions?query=vitis%20v').flush(vitisVResult);

    expect(results).toEqual([[], vitResult, vitisVResult]);

    http.verify();
  }));
});
