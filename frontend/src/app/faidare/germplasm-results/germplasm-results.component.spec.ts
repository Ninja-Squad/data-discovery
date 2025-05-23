import { TestBed } from '@angular/core/testing';

import { GermplasmResultsComponent } from './germplasm-results.component';
import { FaidareDocumentModel } from '../faidare-document.model';
import { Page } from '../../models/page';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { ExportService } from '../export.service';
import { DownloadService } from '../../download.service';
import { ReplaySubject, Subject } from 'rxjs';
import { Model, SearchStateService } from '../../search-state.service';
import { DocumentModel } from '../../models/document.model';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

class GermplasmResultsComponentTester extends ComponentTester<GermplasmResultsComponent> {
  constructor() {
    super(GermplasmResultsComponent);
  }

  get rows() {
    return this.elements('tbody tr');
  }

  get links() {
    return this.elements<HTMLAnchorElement>('tbody tr a');
  }

  get downloadMcpd() {
    return this.button('#download-mcpd-button');
  }

  get downloadPlantMaterial() {
    return this.button('#download-plant-material-button');
  }

  get downloadMcpdSpinner() {
    return this.downloadMcpd.element('.fa-spinner');
  }

  get downloadPlantMaterialSpinner() {
    return this.downloadPlantMaterial.element('.fa-spinner');
  }

  get headers() {
    return this.elements<HTMLElement>('th div');
  }

  get sortedAscHeaders() {
    return this.elements('th div').filter(
      testElement => !!testElement.element('.fa-long-arrow-up')
    );
  }

  get sortedDescHeaders() {
    return this.elements('th div').filter(
      testElement => !!testElement.element('.fa-long-arrow-down')
    );
  }
}

describe('GermplasmResultsComponent', () => {
  let tester: GermplasmResultsComponentTester;
  let exportService: jasmine.SpyObj<ExportService>;
  let downloadService: jasmine.SpyObj<DownloadService>;
  let searchStateService: jasmine.SpyObj<SearchStateService>;
  let modelSubject: ReplaySubject<Model>;

  let initialModel: Model;

  beforeEach(async () => {
    modelSubject = new ReplaySubject<Model>(1);
    searchStateService = createMock(SearchStateService);
    searchStateService.getModel.and.returnValue(modelSubject);

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
    await tester.stable();
  });

  it('should display a table of results', () => {
    expect(tester.rows.length).toBe(2);
    expect(tester.links[0].attr('href')).toBe('http://localhost:8380/faidare-dev/germplasms/g1');
    expect(tester.links[0]).toHaveText('Germplasm 1');
    expect(tester.rows[0]).toContainText('SP1, SP2');
    expect(tester.rows[0]).toContainText('Institute 1');
    expect(tester.rows[0]).toContainText('Natural');
    expect(tester.rows[0]).toContainText('France');
    expect(tester.rows[0]).toContainText('Acc1');
  });

  /*it('should download MCPD results', () => {
    const blob = new Blob();
    const blobSubject = new Subject<Blob>();
    exportService.export.and.returnValue(blobSubject);

    expect(tester.downloadMcpdSpinner).toBeNull();

    tester.downloadMcpd.click();

    expect(tester.downloadMcpdSpinner).not.toBeNull();
    expect(exportService.export).toHaveBeenCalledWith(initialModel.searchCriteria, 'mcpd');

    blobSubject.next(blob);
    blobSubject.complete();
    tester.detectChanges();

    expect(downloadService.download).toHaveBeenCalledWith(blob, 'mcpd.csv');
    expect(tester.downloadMcpdSpinner).toBeNull();
  });*/

  it('should download plant material results', async () => {
    const blob = new Blob();
    const blobSubject = new Subject<Blob>();
    exportService.export.and.returnValue(blobSubject);

    expect(tester.downloadPlantMaterialSpinner).toBeNull();

    await tester.downloadPlantMaterial.click();

    expect(tester.downloadPlantMaterialSpinner).not.toBeNull();
    expect(exportService.export).toHaveBeenCalledWith(
      initialModel.searchCriteria,
      'plant-material'
    );

    blobSubject.next(blob);
    blobSubject.complete();
    await tester.stable();

    expect(downloadService.download).toHaveBeenCalledWith(blob, 'plant-material.csv');
    expect(tester.downloadPlantMaterialSpinner).toBeNull();
  });

  it('should sort', async () => {
    expect(tester.sortedAscHeaders.length).toBe(0);
    expect(tester.sortedDescHeaders.length).toBe(0);

    const speciesHeader = tester.headers[2];
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
    await tester.stable();

    expect(tester.sortedAscHeaders.length).toBe(1);
    expect(tester.sortedAscHeaders[0]).toContainText('Species');
    expect(tester.sortedDescHeaders.length).toBe(0);

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
    await tester.stable();

    expect(tester.sortedAscHeaders.length).toBe(0);
    expect(tester.sortedDescHeaders.length).toBe(1);
    expect(tester.sortedDescHeaders[0]).toContainText('Species');

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
    await tester.stable();

    expect(tester.sortedAscHeaders.length).toBe(1);
    expect(tester.sortedAscHeaders[0]).toContainText('Species');
    expect(tester.sortedDescHeaders.length).toBe(0);
  });
});
