import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Subject } from 'rxjs';

import { toAggregation, toAggregationCriterion, toRareDocument, toSinglePage } from './models/test-model-generators';
import { SearchService } from './search.service';
import { AggregatedPage } from './models/page';
import { DocumentModel } from './models/document.model';

describe('SearchService', () => {
  let service: SearchService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(SearchService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should search for the query', () => {
    let actualResults: AggregatedPage<DocumentModel>;
    service.search('Bacteria',  [], 2)
      .subscribe(results => actualResults = results);

    const resource = toRareDocument('Bacteria');
    const expectedResults = toSinglePage([resource]);

    http.expectOne('api/search?query=Bacteria&page=1&highlight=true').flush(expectedResults);
    expect(actualResults).toEqual(expectedResults);
  });

  it('should fetch the aggregations only', () => {
    let actualResults: AggregatedPage<DocumentModel>;
    service.aggregate('Bacteria', [])
      .subscribe(results => actualResults = results);

    const resource = toRareDocument('Bacteria');
    const aggregation = toAggregation('coo', ['France', 'Italy']);
    const expectedResults = toSinglePage([resource], [aggregation]);

    http.expectOne('api/aggregate?query=Bacteria').flush(expectedResults);
    expect(actualResults).toEqual(expectedResults);
  });

  it('should search for the query and add the aggregations selected', () => {
    let actualResults: AggregatedPage<DocumentModel>;
    const cooCriteria = toAggregationCriterion('coo', ['France', 'Italy']);
    const domainCriteria = toAggregationCriterion('domain', ['Forest']);
    service.search('Bacteria', [cooCriteria, domainCriteria], 1)
      .subscribe(results => actualResults = results);

    const resource = toRareDocument('Bacteria');
    const expectedResults = toSinglePage([resource]);

    http.expectOne('api/search?query=Bacteria&page=0&highlight=true&coo=France&coo=Italy&domain=Forest')
      .flush(expectedResults);
    expect(actualResults).toEqual(expectedResults);
  });

  it('should search for the query, fetch the aggregations and add the aggregations selected', () => {
    let actualResults: AggregatedPage<DocumentModel>;
    let actualAggregations: AggregatedPage<DocumentModel>;
    const cooCriteria = toAggregationCriterion('coo', ['France', 'Italy']);
    const domainCriteria = toAggregationCriterion('domain', ['Forest']);
    service.search('Bacteria', [cooCriteria, domainCriteria], 1)
      .subscribe(results => actualResults = results);
    service.aggregate('Bacteria', [cooCriteria, domainCriteria])
      .subscribe(agg => actualAggregations = agg);

    const resource = toRareDocument('Bacteria');
    const aggregation = toAggregation('coo', ['France', 'Italy']);
    const expectedResults = toSinglePage([resource]);
    const expectedAggregations = toSinglePage([resource], [aggregation]);

    http.expectOne('api/search?query=Bacteria&page=0&highlight=true&coo=France&coo=Italy&domain=Forest')
      .flush(expectedResults);
    http.expectOne('api/aggregate?query=Bacteria&coo=France&coo=Italy&domain=Forest').flush(expectedAggregations);
    expect(actualResults).toEqual(expectedResults);
    expect(actualAggregations).toEqual(expectedAggregations);
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
    http.expectOne('api/suggest?query=vit').flush(vitResult);

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
    http.expectOne('api/suggest?query=vitis%20v').flush(vitisVResult);

    expect(results).toEqual([[], vitResult, vitisVResult]);

    http.verify();
  }));
});
