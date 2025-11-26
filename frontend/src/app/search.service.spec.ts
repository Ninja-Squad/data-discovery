import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject } from 'rxjs';

import {
  toAggregation,
  toAggregationCriterion,
  toRareDocument,
  toSinglePage
} from './models/test-model-generators';
import { SearchService } from './search.service';
import { Aggregation, Page } from './models/page';
import { DocumentModel } from './models/document.model';

describe('SearchService', () => {
  let service: SearchService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()]
    });

    service = TestBed.inject(SearchService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => jasmine.clock().uninstall());

  it('should search for the query', () => {
    let actualResults: Page<DocumentModel>;
    service
      .search({
        query: 'Bacteria',
        aggregationCriteria: [],
        page: 1,
        descendants: false,
        sortCriterion: null
      })
      .subscribe(results => (actualResults = results));

    const resource = toRareDocument('Bacteria');
    const expectedResults = toSinglePage([resource]);

    http
      .expectOne('api/search?query=Bacteria&page=0&highlight=true&descendants=false')
      .flush(expectedResults);
    expect(actualResults).toEqual(expectedResults);
  });

  it('should search for the query with sort', () => {
    let actualResults: Page<DocumentModel>;
    service
      .search({
        query: 'Bacteria',
        aggregationCriteria: [],
        page: 1,
        descendants: false,
        sortCriterion: { sort: 'name', direction: 'desc' }
      })
      .subscribe(results => (actualResults = results));

    const resource = toRareDocument('Bacteria');
    const expectedResults = toSinglePage([resource]);

    http
      .expectOne(
        'api/search?query=Bacteria&page=0&highlight=true&descendants=false&sort=name&direction=desc'
      )
      .flush(expectedResults);
    expect(actualResults).toEqual(expectedResults);
  });

  it('should fetch the aggregations only', () => {
    let actualResults: Array<Aggregation>;
    service
      .aggregate({
        query: 'Bacteria',
        aggregationCriteria: [],
        descendants: false
      })
      .subscribe(results => (actualResults = results));

    const aggregation = toAggregation('coo', ['France', 'Italy']);
    const expectedResults = [aggregation];

    http.expectOne('api/aggregate?query=Bacteria&descendants=false').flush(expectedResults);
    expect(actualResults).toEqual(expectedResults);
  });

  it('should search for the query and add the aggregations selected', () => {
    let actualResults: Page<DocumentModel>;
    const cooCriteria = toAggregationCriterion('coo', ['France', 'Italy']);
    const domainCriteria = toAggregationCriterion('domain', ['Forest']);
    service
      .search({
        query: 'Bacteria',
        aggregationCriteria: [cooCriteria, domainCriteria],
        page: 1,
        descendants: false,
        sortCriterion: null
      })
      .subscribe(results => (actualResults = results));

    const resource = toRareDocument('Bacteria');
    const expectedResults = toSinglePage([resource]);

    http
      .expectOne(
        'api/search?query=Bacteria&page=0&highlight=true&descendants=false&coo=France&coo=Italy&domain=Forest'
      )
      .flush(expectedResults);
    expect(actualResults).toEqual(expectedResults);
  });

  it('should fetch the aggregations and add the aggregations selected', () => {
    let actualResults: Page<DocumentModel>;
    let actualAggregations: Array<Aggregation>;
    const cooCriteria = toAggregationCriterion('coo', ['France', 'Italy']);
    const domainCriteria = toAggregationCriterion('domain', ['Forest']);
    service
      .search({
        query: 'Bacteria',
        aggregationCriteria: [cooCriteria, domainCriteria],
        page: 1,
        descendants: false,
        sortCriterion: null
      })
      .subscribe(results => (actualResults = results));
    service
      .aggregate({
        query: 'Bacteria',
        aggregationCriteria: [cooCriteria, domainCriteria],
        descendants: false
      })
      .subscribe(agg => (actualAggregations = agg));

    const resource = toRareDocument('Bacteria');
    const aggregation = toAggregation('coo', ['France', 'Italy']);
    const expectedResults = toSinglePage([resource]);
    const expectedAggregations = [aggregation];

    http
      .expectOne(
        'api/search?query=Bacteria&page=0&highlight=true&descendants=false&coo=France&coo=Italy&domain=Forest'
      )
      .flush(expectedResults);
    http
      .expectOne(
        'api/aggregate?query=Bacteria&descendants=false&coo=France&coo=Italy&domain=Forest'
      )
      .flush(expectedAggregations);
    expect(actualResults).toEqual(expectedResults);
    expect(actualAggregations).toEqual(expectedAggregations);
  });

  it('should have a typeahead that suggests if text longer than 1, after 300 ms and only if changed', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate();

    const typeahead = service.getSuggesterTypeahead();

    const entered = new Subject<string>();
    const results: Array<Array<string>> = [];
    typeahead(entered).subscribe(result => results.push(result));

    // simulate what is entered, character by character, after a delay between each one
    entered.next(' ');
    jasmine.clock().tick(100);
    entered.next(' v');
    jasmine.clock().tick(300); // should not trigger a search, but emit an empty array because input is too short
    entered.next(' vi');
    jasmine.clock().tick(100);
    entered.next(' vit');
    jasmine.clock().tick(100);
    entered.next(' vit');
    jasmine.clock().tick(100);
    entered.next(' vit ');
    jasmine.clock().tick(300); // should finally trigger a search for 'vit'

    const vitResult = ['vitis', 'vitis vinifera'];
    http.expectOne('api/suggest?query=vit').flush(vitResult);

    entered.next(' viti ');
    jasmine.clock().tick(100);
    entered.next(' viti');
    jasmine.clock().tick(100);
    entered.next(' vit');
    jasmine.clock().tick(300); // should not trigger a second search since same value

    entered.next(' viti');
    jasmine.clock().tick(100);
    entered.next(' vitis');
    jasmine.clock().tick(100);
    entered.next(' vitis ');
    jasmine.clock().tick(100);
    entered.next(' vitis v');
    jasmine.clock().tick(300); // should trigger a second search

    const vitisVResult = ['vitis vinifera'];
    http.expectOne('api/suggest?query=vitis%20v').flush(vitisVResult);

    expect(results).toEqual([[], vitResult, vitisVResult]);

    http.verify();
  });
});
