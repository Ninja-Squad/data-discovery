import { TestBed } from '@angular/core/testing';

import { FaidareDocumentListComponent } from './faidare-document-list.component';
import { ComponentTester } from 'ngx-speculoos';
import { By } from '@angular/platform-browser';
import { GenericDocumentComponent } from '../../urgi-common/generic-document/generic-document.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { Aggregation, Page } from '../../models/page';
import { DocumentModel } from '../../models/document.model';
import { toSinglePage } from '../../models/test-model-generators';
import { NgbNavLink } from '@ng-bootstrap/ng-bootstrap';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';
import { DataDiscoveryNgbTestingModule } from '../../data-discovery-ngb-testing.module';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { GermplasmResultsComponent } from '../germplasm-results/germplasm-results.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SortableHeaderComponent } from '../germplasm-results/sortable-header/sortable-header.component';

@Component({
  template:
    '<dd-document-list [documents]="documents" [aggregations]="aggregations"></dd-document-list>'
})
class TestComponent {
  documents: Page<DocumentModel> = toSinglePage([
    { name: 'doc 1', description: 'desc 1', identifier: 'd1', species: [] }
  ]);
  aggregations: Array<Aggregation> = [];
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get documents() {
    return this.debugElement.queryAll(By.directive(GenericDocumentComponent));
  }

  get germplasmResults() {
    return this.debugElement.query(By.directive(GermplasmResultsComponent));
  }

  get tabs() {
    return this.debugElement.queryAll(By.directive(NgbNavLink));
  }

  get firstTab() {
    return this.element('a')!;
  }

  get secondTab() {
    return this.elements('a')[1];
  }
}

describe('FaidareDocumentListComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        FaidareDocumentListComponent,
        GenericDocumentComponent,
        TruncatableDescriptionComponent,
        GermplasmResultsComponent,
        SortableHeaderComponent
      ],
      imports: [
        RouterTestingModule,
        DataDiscoveryNgbTestingModule,
        I18nTestingModule,
        HttpClientTestingModule
      ]
    });
    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should list documents if no germplasm', () => {
    expect(tester.documents.length).toBe(1);
    // no germplasm tab
    expect(tester.tabs.length).toBe(0);
  });

  it('should list documents in a germplasm tab if there is a germplasm document', () => {
    // given one entry aggregation, with one document of type germplasm
    const entry: Aggregation = {
      name: 'entry',
      type: 'SMALL',
      buckets: [{ key: 'Germplasm', documentCount: 1 }]
    };
    tester.componentInstance.aggregations = [entry];
    tester.detectChanges();

    // then we have a germplasm tab
    expect(tester.tabs.length).toBe(2);
    // first tab is All and is active
    expect(tester.firstTab).toHaveText('All');
    expect(tester.secondTab).toHaveText('Germplasm');
    expect(tester.documents.length).toBe(1);
    expect(tester.germplasmResults).toBeNull();

    tester.secondTab.click();
    expect(tester.documents.length).toBe(0);
    expect(tester.germplasmResults).not.toBeNull();

    tester.firstTab.click();
    expect(tester.documents.length).toBe(1);
    expect(tester.germplasmResults).toBeNull();
  });

  it('should trigger a search when switching tabs', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    const route = TestBed.inject(ActivatedRoute);
    // given one entry aggregation, with one document of type germplasm
    const entry: Aggregation = {
      name: 'entry',
      type: 'SMALL',
      buckets: [{ key: 'Germplasm', documentCount: 1 }]
    };
    tester.componentInstance.aggregations = [entry];
    tester.detectChanges();

    // select the germplasm tab
    tester.secondTab.click();
    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: route,
      fragment: 'germplasm',
      queryParams: { entry: 'Germplasm' },
      queryParamsHandling: 'merge'
    });

    // select the all tab
    tester.firstTab.click();
    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: route,
      fragment: undefined,
      queryParams: {},
      queryParamsHandling: 'merge'
    });
  });

  it('should select the proper tab when the fragment changes', () => {
    const route = TestBed.inject(ActivatedRoute);
    // given one entry aggregation, with one document of type germplasm
    const entry: Aggregation = {
      name: 'entry',
      type: 'SMALL',
      buckets: [{ key: 'Germplasm', documentCount: 1 }]
    };
    tester.componentInstance.aggregations = [entry];
    tester.detectChanges();

    // the germplasm tab is not selected by default
    expect(tester.documents.length).toBe(1);
    expect(tester.germplasmResults).toBeNull();

    (route.fragment as Subject<string | null>).next('germplasm');
    tester.detectChanges();
    // then the germplasm tab is selected
    expect(tester.germplasmResults).not.toBeNull();
  });
});
