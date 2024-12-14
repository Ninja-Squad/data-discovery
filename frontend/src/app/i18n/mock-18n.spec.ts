import { importProvidersFrom, inject, provideEnvironmentInitializer } from '@angular/core';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import EN_TRANSLATIONS from './en.json';

class CustomMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    throw new Error(`Missing translation for key ${params.key}`);
  }
}

/**
 * Returns the necessary providers for i18n from ngx-translate to use in a test.
 * Uses the FR locale and a custom missing translation handler that throws an error.
 */
export const provideI18nTesting = () => {
  return [
    importProvidersFrom([
      TranslateModule.forRoot({
        useDefaultLang: false,
        missingTranslationHandler: {
          provide: MissingTranslationHandler,
          useClass: CustomMissingTranslationHandler
        }
      })
    ]),
    provideEnvironmentInitializer(() => {
      const translateService = inject(TranslateService);
      translateService.setTranslation('en', EN_TRANSLATIONS);
      translateService.use('en');
    })
  ];
};
