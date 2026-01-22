import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';
import { createMock, MockObject } from '../../test/mock';

import { PillarsComponent } from './pillars.component';
import { PillarService } from '../pillar.service';
import { PillarModel } from '../models/pillar.model';
import { provideI18nTesting } from '../i18n/mock-18n';

class PillarsComponentTester {
  readonly fixture = TestBed.createComponent(PillarsComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly dataProviders = page.getByRole('heading', { level: 4 });
  readonly pillarListItems = page.getByCss('ul.pillar > li');
  readonly noDataAlert = page.getByRole('alert');

  pillarListItem(index: number) {
    return this.pillarListItems.nth(index);
  }

  databaseSourceItem(pillarIndex: number, sourceIndex: number) {
    return this.pillarListItem(pillarIndex).getByCss('li').nth(sourceIndex);
  }

  databaseSourceLink(pillarIndex: number, sourceIndex: number) {
    return this.databaseSourceItem(pillarIndex, sourceIndex).getByCss('a');
  }
}

describe('PillarsComponent', () => {
  let tester: PillarsComponentTester;
  let pillarService: MockObject<PillarService>;
  const pillars$ = new Subject<Array<PillarModel>>();

  beforeEach(async () => {
    registerLocaleData(localeFr);
    pillarService = createMock(PillarService);
    pillarService.list.mockReturnValue(pillars$);
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: PillarService, useValue: pillarService }]
    });

    tester = new PillarsComponentTester();
    await tester.fixture.whenStable();
  });

  test('should not display any pillar nor any alert while pillars are not available yet', async () => {
    await expect.element(tester.pillarListItems).toHaveLength(0);
    // Alert doesn't exist yet, will appear when data loads
  });

  test('should display pillars', async () => {
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

    await tester.fixture.whenStable();

    await expect.element(tester.dataProviders).toHaveTextContent('Data providers');

    await expect.element(tester.pillarListItem(0)).toHaveTextContent('Plant');
    await expect.element(tester.pillarListItem(1)).toHaveTextContent('Forest');

    await expect.element(tester.databaseSourceItem(0, 0)).toHaveTextContent('Florilège');
    await expect.element(tester.databaseSourceItem(0, 0)).toHaveTextContent('[1,000]');

    await expect.element(tester.databaseSourceItem(0, 1)).toHaveTextContent('CNRGV');
    await expect.element(tester.databaseSourceItem(0, 1)).toHaveTextContent('[200]');

    await expect(tester.databaseSourceLink(0, 0).element().getAttribute('href')).toBe(
      'http://florilege.arcad-project.org/fr/collections'
    );
    await expect.element(tester.databaseSourceLink(0, 1)).not.toBeInTheDocument();
  });

  test('should display alert if no pillar has been found', async () => {
    pillars$.next([]);
    await tester.fixture.whenStable();

    await expect.element(tester.noDataAlert).toHaveTextContent('No data found');
  });
});
