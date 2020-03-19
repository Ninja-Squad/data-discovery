import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EMPTY, of } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';

import { PillarsComponent } from './pillars.component';
import { PillarService } from '../pillar.service';
import { PillarModel } from '../models/pillar.model';
import { DocumentCountComponent } from '../document-count/document-count.component';

class PillarsComponentTester extends ComponentTester<PillarsComponent> {
  constructor() {
    super(PillarsComponent);
  }

  get pillarListItems() {
    return this.elements('ul.pillar > li');
  }

  pillarListItem(index: number) {
    return this.pillarListItems[index];
  }

  databaseSourceItem(pillarIndex: number, sourceIndex: number) {
    return this.pillarListItem(pillarIndex).elements('li')[sourceIndex];
  }

  databaseSourceLink(pillarIndex: number, sourceIndex: number) {
    return this.databaseSourceItem(pillarIndex, sourceIndex).element('a');
  }

  get noDataAlert() {
    return this.element('.alert');
  }
}

describe('PillarsComponent', () => {
  let tester: PillarsComponentTester;
  let pillarService: PillarService;

  beforeEach(() => {
    registerLocaleData(localeFr);
    TestBed.configureTestingModule({
      declarations: [PillarsComponent, DocumentCountComponent],
      imports: [
        HttpClientTestingModule,
        NgbTooltipModule
      ],
      providers: [
        { provide: LOCALE_ID, useValue: 'fr-FR' }
      ]
    });

    tester = new PillarsComponentTester();
    pillarService = TestBed.inject(PillarService);

    jasmine.addMatchers(speculoosMatchers);
  });

  it('should not display any pillar nor any alert while pillars are not available yet', () => {
    spyOn(pillarService, 'list').and.returnValue(EMPTY);

    tester.detectChanges();

    expect(tester.pillarListItems.length).toBe(0);
    expect(tester.noDataAlert).toBeNull();
  });

  it('should display pillars', () => {
    const pillars: Array<PillarModel> = [
      {
        name: 'Plant',
        databaseSources: [
          {
            name: 'Florilège',
            documentCount: 1000,
            url: 'http://florilege.arcad-project.org/fr/collections'
          },
          {
            name: 'CNRGV',
            documentCount: 200,
            url: null
          }
        ]
      },
      {
        name: 'Forest',
        databaseSources: []
      }
    ];
    spyOn(pillarService, 'list').and.returnValue(of(pillars));

    tester.detectChanges();

    expect(tester.pillarListItem(0)).toContainText('Plant');
    expect(tester.pillarListItem(1)).toContainText('Forest');

    expect(tester.databaseSourceItem(0, 0)).toContainText('Florilège');
    expect(tester.databaseSourceItem(0, 0)).toContainText('[1\u202f000]');

    expect(tester.databaseSourceItem(0, 1)).toContainText('CNRGV');
    expect(tester.databaseSourceItem(0, 1)).toContainText('[200]');

    expect(tester.databaseSourceLink(0, 0).attr('href'))
      .toBe('http://florilege.arcad-project.org/fr/collections');
    expect(tester.databaseSourceLink(0, 1)).toBeNull();
  });

  it('should display alert if no pillar has been found', () => {
    spyOn(pillarService, 'list').and.returnValue(of([]));

    tester.detectChanges();

    expect(tester.noDataAlert).toContainText('No data found');
  });
});
