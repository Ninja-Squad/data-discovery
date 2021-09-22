import { TestBed } from '@angular/core/testing';

import { GermplasmResultsComponent } from './germplasm-results.component';
import { Component } from '@angular/core';
import { FaidareDocumentModel } from '../faidare-document.model';
import { Page } from '../../models/page';
import { ComponentTester } from 'ngx-speculoos';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';

@Component({
  template: '<dd-germplasm-results [documents]="documents"></dd-germplasm-results>'
})
class TestComponent {
  documents!: Page<FaidareDocumentModel>;
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get rows() {
    return this.elements('tbody tr');
  }

  get links() {
    return this.elements<HTMLAnchorElement>('tbody tr a');
  }
}

describe('GermplasmResultsComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [TestComponent, GermplasmResultsComponent]
    });

    tester = new TestComponentTester();
    tester.componentInstance.documents = {
      content: [
        {
          identifier: 'g1',
          name: 'Germplasm 1',
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

    tester.detectChanges();
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
});
