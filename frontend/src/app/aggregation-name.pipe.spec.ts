import { TestBed } from '@angular/core/testing';
import { MissingTranslationHandler } from '@ngx-translate/core';
import { beforeEach, describe, expect, test } from 'vitest';

import { AggregationNamePipe } from './aggregation-name.pipe';
import { provideI18nTesting } from './i18n/mock-18n';

describe('AggregationNamePipe', () => {
  let pipe: AggregationNamePipe;

  beforeEach(() => {
    // override the missing translation handler for this test, as we want to check
    // what happens when the translation is not found (as it is when running the app)
    const missingTranslationHandler: MissingTranslationHandler = {
      handle(): undefined {
        // tests usually throws when a key is not found
        // here we do nothing
      }
    };

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting({
          missingTranslationHandler: {
            provide: MissingTranslationHandler,
            useValue: missingTranslationHandler
          }
        })
      ]
    });

    pipe = TestBed.runInInjectionContext(() => new AggregationNamePipe());
  });

  test('should return the displayed name of an aggregation', () => {
    // for known aggregation names
    const cooResult = pipe.transform('coo');
    expect(cooResult).toBe('Country of origin');
    const domainResult = pipe.transform('domain');
    expect(domainResult).toBe('Domain');
  });

  test('should return the key for an unknown aggregation', () => {
    // for an unknown aggregation names
    const result = pipe.transform('unknown');
    expect(result).toBe('unknown');
  });
});
