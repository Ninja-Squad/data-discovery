import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  Provider,
  Service
} from '@angular/core';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  provideMissingTranslationHandler,
  provideTranslateService,
  TranslateService
} from '@ngx-translate/core';
import EN_TRANSLATIONS from './en.json';

@Service()
class CustomMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): never {
    throw new Error(`Missing translation for key ${params.key}`);
  }
}

/**
 * Returns the necessary providers for i18n from ngx-translate to use in a test.
 * Uses the FR locale and a custom missing translation handler that throws an error.
 */
export function provideI18nTesting(options?: {
  missingTranslationHandler: Provider;
}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideTranslateService({
      missingTranslationHandler:
        options?.missingTranslationHandler ??
        provideMissingTranslationHandler(CustomMissingTranslationHandler)
    }),
    provideEnvironmentInitializer(() => {
      const translateService = inject(TranslateService);
      translateService.setTranslation('en', EN_TRANSLATIONS);
      translateService.use('en');
    })
  ]);
}
