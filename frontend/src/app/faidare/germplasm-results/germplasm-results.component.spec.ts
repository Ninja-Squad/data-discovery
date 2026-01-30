import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';
import { createMock, MockObject } from '../../../test/mock';

import { GermplasmResultsComponent } from './germplasm-results.component';
import { FaidareDocumentModel } from '../faidare-document.model';
import { Page } from '../../models/page';
import { ExportService } from '../export.service';
import { DownloadService } from '../../download.service';
import { ReplaySubject, Subject } from 'rxjs';
import { Model, SearchStateService } from '../../search-state.service';
import { DocumentModel } from '../../models/document.model';
import { provideI18nTesting } from '../../i18n/mock-18n';

class GermplasmResultsComponentTester {
  readonly fixture = TestBed.createComponent(GermplasmResultsComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly rows = page.getByCss('tbody tr');
  readonly links = page.getByCss('tbody tr a');
  readonly downloadDropdown = page.getByCss('#download-dropdown');
  readonly downloadMcpd = page.getByCss('#download-mcpd');
  readonly downloadPlantMaterial = page.getByCss('#download-plant-material');
  readonly downloadMiappeExcel = page.getByCss('#download-miappe-excel');
  readonly downloadSpinner = this.downloadDropdown.getByCss('.fa-spinner');
  readonly headers = page.getByCss('th div');
  readonly sortedAscHeaders = page.getByCss('div:has(> .fa-long-arrow-up)');
  readonly sortedDescHeaders = page.getByCss('div:has(> .fa-long-arrow-down)');
}

describe('GermplasmResultsComponent', () => {
  let tester: GermplasmResultsComponentTester;
  let exportService: MockObject<ExportService>;
  let downloadService: MockObject<DownloadService>;
  let searchStateService: MockObject<SearchStateService>;
  let modelSubject: ReplaySubject<Model>;

  let initialModel: Model;

  beforeEach(async () => {
    modelSubject = new ReplaySubject<Model>(1);
    searchStateService = createMock(SearchStateService);
    searchStateService.getModel.mockReturnValue(modelSubject);

    exportService = createMock(ExportService);
    downloadService = createMock(DownloadService);

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        { provide: ExportService, useValue: exportService },
        { provide: DownloadService, useValue: downloadService },
        { provide: SearchStateService, useValue: searchStateService }
      ]
    });

    tester = new GermplasmResultsComponentTester();
    const documents: Page<FaidareDocumentModel> = {
      content: [
        {
          identifier: 'g1',
          name: 'Germplasm 1',
          url: 'http://localhost:8380/faidare-dev/germplasms/g1',
          species: ['SP1', 'SP2'],
          holdingInstitute: 'Institute 1',
          biologicalStatus: 'Natural',
          countryOfOrigin: 'France',
          accessionNumber: 'Acc1'
        },
        {
          identifier: 'g2',
          name: 'Germplasm 2',
          species: ['SP3', 'SP4'],
          holdingInstitute: 'Institute 2',
          biologicalStatus: 'Cross',
          countryOfOrigin: 'Germany',
          accessionNumber: 'Acc2'
        }
      ]
    } as Page<FaidareDocumentModel>;

    initialModel = {
      documents: documents as Page<DocumentModel>,
      searchCriteria: {
        sortCriterion: null,
        query: 'test',
        aggregationCriteria: [{ name: 'entry', values: ['Germplasm'] }],
        descendants: true
      }
    } as Model;
    modelSubject.next(initialModel);
    await tester.fixture.whenStable();
  });

  test('should display a table of results', async () => {
    expect(tester.rows).toHaveLength(2);
    await expect(tester.links.nth(0).element().getAttribute('href')).toBe(
      'http://localhost:8380/faidare-dev/germplasms/g1'
    );
    await expect.element(tester.links.nth(0)).toHaveTextContent('Germplasm 1');
    await expect.element(tester.rows.nth(0)).toHaveTextContent('SP1, SP2');
    await expect.element(tester.rows.nth(0)).toHaveTextContent('Institute 1');
    await expect.element(tester.rows.nth(0)).toHaveTextContent('Natural');
    await expect.element(tester.rows.nth(0)).toHaveTextContent('France');
    await expect.element(tester.rows.nth(0)).toHaveTextContent('Acc1');
  });

  test('should download plant material results (CSV)', async () => {
    const blob = new Blob();
    const blobSubject = new Subject<Blob>();
    exportService.export.mockReturnValue(blobSubject);

    await expect.element(tester.downloadSpinner).not.toBeInTheDocument();

    await tester.downloadDropdown.click();
    await tester.downloadPlantMaterial.click();

    await expect.element(tester.downloadSpinner).toBeInTheDocument();
    expect(exportService.export).toHaveBeenCalledWith(
      initialModel.searchCriteria,
      'plant-material'
    );

    blobSubject.next(blob);
    blobSubject.complete();
    await tester.fixture.whenStable();

    expect(downloadService.download).toHaveBeenCalledWith(blob, 'plant-material.csv');
    await expect.element(tester.downloadSpinner).not.toBeInTheDocument();
  });

  test('should download miappe results (Excel)', async () => {
    const blob = new Blob();
    const blobSubject = new Subject<Blob>();
    exportService.export.mockReturnValue(blobSubject);

    await expect.element(tester.downloadSpinner).not.toBeInTheDocument();

    await tester.downloadDropdown.click();
    await tester.downloadMiappeExcel.click();

    await expect.element(tester.downloadSpinner).toBeInTheDocument();
    expect(exportService.export).toHaveBeenCalledWith(initialModel.searchCriteria, 'miappe-excel');

    blobSubject.next(blob);
    blobSubject.complete();
    await tester.fixture.whenStable();

    expect(downloadService.download).toHaveBeenCalledWith(blob, 'miappe.xlsx');
    await expect.element(tester.downloadSpinner).not.toBeInTheDocument();
  });

  test('should sort', async () => {
    expect(tester.sortedAscHeaders.length).toBe(0);
    expect(tester.sortedDescHeaders.length).toBe(0);

    const speciesHeader = tester.headers.nth(2);
    await speciesHeader.click();

    expect(searchStateService.sort).toHaveBeenCalledWith({
      sort: 'species',
      direction: 'asc'
    });

    // simulate the model changing
    modelSubject.next({
      ...initialModel,
      searchCriteria: {
        ...initialModel.searchCriteria,
        sortCriterion: {
          sort: 'species',
          direction: 'asc'
        }
      }
    });
    await tester.fixture.whenStable();

    await expect.element(tester.sortedAscHeaders).toHaveLength(1);
    await expect.element(tester.sortedAscHeaders.nth(0)).toHaveTextContent('Species');
    await expect.element(tester.sortedDescHeaders).toHaveLength(0);

    await speciesHeader.click();

    expect(searchStateService.sort).toHaveBeenCalledWith({
      sort: 'species',
      direction: 'desc'
    });

    // simulate the query params changing
    modelSubject.next({
      ...initialModel,
      searchCriteria: {
        ...initialModel.searchCriteria,
        sortCriterion: {
          sort: 'species',
          direction: 'desc'
        }
      }
    });
    await tester.fixture.whenStable();

    await expect.element(tester.sortedAscHeaders).toHaveLength(0);
    await expect.element(tester.sortedDescHeaders).toHaveLength(1);
    await expect.element(tester.sortedDescHeaders.nth(0)).toHaveTextContent('Species');

    await speciesHeader.click();

    expect(searchStateService.sort).toHaveBeenCalledWith({
      sort: 'species',
      direction: 'asc'
    });

    // simulate the model changing
    modelSubject.next({
      ...initialModel,
      searchCriteria: {
        ...initialModel.searchCriteria,
        sortCriterion: {
          sort: 'species',
          direction: 'asc'
        }
      }
    });
    await tester.fixture.whenStable();

    await expect.element(tester.sortedAscHeaders).toHaveLength(1);
    await expect.element(tester.sortedAscHeaders.nth(0)).toHaveTextContent('Species');
    await expect.element(tester.sortedDescHeaders).toHaveLength(0);
  });
});
