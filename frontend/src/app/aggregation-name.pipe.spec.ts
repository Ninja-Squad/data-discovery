import { AggregationNamePipe } from './aggregation-name.pipe';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideI18nTesting } from './i18n/mock-18n.spec';

describe('AggregationNamePipe', () => {
  let pipe: AggregationNamePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });
    const translate = TestBed.inject(TranslateService);
    // override the missing translation handler for this test, as we want to check
    // what happens when the translation is not found (as it is when running the app)
    translate.missingTranslationHandler = {
      handle() {
        // tests usually throws when a key is not found
        // here we do nothing
      }
    };
    pipe = new AggregationNamePipe(translate);
  });

  it('should return the displayed name of an aggregation', () => {
    // for known aggregation names
    const cooResult = pipe.transform('coo');
    expect(cooResult).toBe('Country of origin');
    const domainResult = pipe.transform('domain');
    expect(domainResult).toBe('Domain');
  });

  it('should return the key for an unknown aggregation', () => {
    // for an unknown aggregation names
    const result = pipe.transform('unknown');
    expect(result).toBe('unknown');
  });
});
