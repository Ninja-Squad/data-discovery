import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';
import { createMock, MockObject } from '../../../test/mock';

import {
  FaidareDocumentListComponent,
  toAllTransition,
  toGermplasmTransition
} from './faidare-document-list.component';
import { Aggregation } from '../../models/page';
import { ReplaySubject } from 'rxjs';
import { Model, SearchCriteria, SearchStateService } from '../../search-state.service';
import { toSinglePage } from '../../models/test-model-generators';
import { DocumentModel } from '../../models/document.model';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { provideDisabledNgbAnimation } from '../../disable-animations';
import { GermplasmResultsComponent } from '../germplasm-results/germplasm-results.component';

class FaidareDocumentListComponentTester {
  constructor() {
    TestBed.createComponent(FaidareDocumentListComponent);
  }
  readonly documents = page.getByCss('dd-document');
  readonly germplasmResults = page.getByCss('dd-germplasm-results');
  readonly tabs = page.getByCss('.nav-link');
  readonly firstTab = page.getByCss('.nav-link').first();
  readonly secondTab = page.getByCss('.nav-link').nth(1);
}

@Component({
  selector: 'dd-germplasm-results',
  template: 'Germplasm Results here',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class GermplasmResultsStubComponent {}

describe('FaidareDocumentListComponent', () => {
  let tester: FaidareDocumentListComponentTester;
  let modelSubject: ReplaySubject<Model>;
  let searchStateService: MockObject<SearchStateService>;

  beforeEach(() => {
    modelSubject = new ReplaySubject<Model>(1);
    searchStateService = createMock(SearchStateService);
    searchStateService.getModel.mockReturnValue(modelSubject);

    // use a stub for germplasm results
    TestBed.overrideComponent(FaidareDocumentListComponent, {
      remove: {
        imports: [GermplasmResultsComponent]
      },
      add: {
        imports: [GermplasmResultsStubComponent]
      }
    });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideI18nTesting(),
        provideDisabledNgbAnimation(),
        {
          provide: SearchStateService,
          useValue: searchStateService
        }
      ]
    });
    tester = new FaidareDocumentListComponentTester();
  });

  test('should list documents if no germplasm', async () => {
    const model: Model = {
      documents: toSinglePage<DocumentModel>([
        {
          name: 'doc 1',
          description: 'desc 1',
          identifier: 'd1',
          species: []
        } as DocumentModel
      ]),
      aggregations: [] as Array<Aggregation>,
      searchCriteria: {
        fragment: null
      }
    } as Model;
    modelSubject.next(model);

    await expect.element(tester.documents).toHaveLength(1);
    // no germplasm tab
    await expect.element(tester.tabs).toHaveLength(0);
  });

  test('should list documents in a germplasm tab if there is a germplasm document', async () => {
    // given one entry aggregation, with one document of type germplasm
    const entry: Aggregation = {
      name: 'entry',
      type: 'SMALL',
      buckets: [{ key: 'Germplasm', documentCount: 1 }]
    };
    const model: Model = {
      documents: toSinglePage<DocumentModel>([
        {
          name: 'doc 1',
          description: 'desc 1',
          identifier: 'd1',
          species: []
        } as DocumentModel
      ]),
      aggregations: [entry],
      searchCriteria: {
        fragment: null
      }
    } as Model;
    modelSubject.next(model);

    // then we have a germplasm tab
    await expect.element(tester.tabs).toHaveLength(2);
    // first tab is All and is active
    await expect.element(tester.firstTab).toHaveTextContent('All');
    await expect.element(tester.secondTab).toHaveTextContent('Germplasm');
    await expect.element(tester.documents).toHaveLength(1);
    await expect.element(tester.germplasmResults).not.toBeInTheDocument();
    expect(searchStateService.disableAggregation).toHaveBeenCalledWith(null);

    await tester.secondTab.click();
    await expect.element(tester.documents).toHaveLength(0);
    await expect.element(tester.germplasmResults).not.toBeInTheDocument();
    expect(searchStateService.applyTransition).toHaveBeenCalledWith(toGermplasmTransition);

    modelSubject.next({
      ...model,
      searchCriteria: {
        fragment: 'germplasm'
      }
    } as Model);

    searchStateService.applyTransition.mockReset();
    await expect.element(tester.germplasmResults).toBeInTheDocument();

    await tester.firstTab.click();
    await expect.element(tester.germplasmResults).not.toBeInTheDocument();
    await expect.element(tester.documents).toHaveLength(0);
    expect(searchStateService.applyTransition).toHaveBeenCalledWith(toAllTransition);

    modelSubject.next({
      ...model,
      searchCriteria: {
        fragment: 'all'
      }
    } as Model);

    await expect.element(tester.documents).toHaveLength(1);
  });

  test('should transition to all', async () => {
    const criteria: SearchCriteria = {
      fragment: 'germplasm',
      page: 2,
      aggregationCriteria: [
        { name: 'entry', values: ['Germplasm'] },
        { name: 'species', values: ['SP1'] }
      ],
      descendants: true,
      sortCriterion: { sort: 'foo', direction: 'asc' },
      query: 'test'
    };
    const newCriteria = toAllTransition(criteria);
    expect(newCriteria).toEqual({
      fragment: null,
      page: 1,
      aggregationCriteria: [
        { name: 'entry', values: ['Germplasm'] },
        { name: 'species', values: ['SP1'] }
      ],
      descendants: true,
      sortCriterion: null,
      query: 'test'
    });
  });

  test('should transition to Germplasm', () => {
    const criteria: SearchCriteria = {
      fragment: null,
      page: 2,
      aggregationCriteria: [],
      descendants: true,
      sortCriterion: null,
      query: 'test'
    };
    const newCriteria = toGermplasmTransition(criteria);
    expect(newCriteria).toEqual({
      fragment: 'germplasm',
      page: 1,
      aggregationCriteria: [{ name: 'entry', values: ['Germplasm'] }],
      descendants: true,
      sortCriterion: null,
      query: 'test'
    });
  });

  test('should transition to Germplasm when entry aggregation already there', () => {
    const criteria: SearchCriteria = {
      fragment: null,
      page: 2,
      aggregationCriteria: [
        { name: 'entry', values: ['Germplasm', 'other'] },
        { name: 'species', values: ['SP1'] }
      ],
      descendants: true,
      sortCriterion: null,
      query: 'test'
    };
    const newCriteria = toGermplasmTransition(criteria);
    expect(newCriteria).toEqual({
      fragment: 'germplasm',
      page: 1,
      aggregationCriteria: [
        { name: 'species', values: ['SP1'] },
        { name: 'entry', values: ['Germplasm'] }
      ],
      descendants: true,
      sortCriterion: null,
      query: 'test'
    });
  });
});
