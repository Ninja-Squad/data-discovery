import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ComponentTester, createMock } from 'ngx-speculoos';

import { PillarsComponent } from './pillars.component';
import { PillarService } from '../pillar.service';
import { PillarModel } from '../models/pillar.model';
import { provideI18nTesting } from '../i18n/mock-18n.spec';

class PillarsComponentTester extends ComponentTester<PillarsComponent> {
  constructor() {
    super(PillarsComponent);
  }

  get dataProviders() {
    return this.element('h4');
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
  let pillarService: jasmine.SpyObj<PillarService>;
  const pillars$ = new Subject<Array<PillarModel>>();

  beforeEach(() => {
    registerLocaleData(localeFr);
    pillarService = createMock(PillarService);
    pillarService.list.and.returnValue(pillars$);
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: PillarService, useValue: pillarService }]
    });

    tester = new PillarsComponentTester();
    tester.detectChanges();
  });

  it('should not display any pillar nor any alert while pillars are not available yet', () => {
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
    pillars$.next(pillars);

    tester.detectChanges();

    expect(tester.dataProviders).toHaveText('Data providers');

    expect(tester.pillarListItem(0)).toContainText('Plant');
    expect(tester.pillarListItem(1)).toContainText('Forest');

    expect(tester.databaseSourceItem(0, 0)).toContainText('Florilège');
    expect(tester.databaseSourceItem(0, 0)).toContainText('[1,000]');

    expect(tester.databaseSourceItem(0, 1)).toContainText('CNRGV');
    expect(tester.databaseSourceItem(0, 1)).toContainText('[200]');

    expect(tester.databaseSourceLink(0, 0).attr('href')).toBe(
      'http://florilege.arcad-project.org/fr/collections'
    );
    expect(tester.databaseSourceLink(0, 1)).toBeNull();
  });

  it('should display alert if no pillar has been found', () => {
    pillars$.next([]);
    tester.detectChanges();

    expect(tester.noDataAlert).toContainText('No data found');
  });
});
