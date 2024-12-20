import { TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';

export class ModuleTranslateLoader implements TranslateLoader {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTranslation(lang: string): Observable<any> {
    return from(import(`./${lang}.json`).then(m => m.default));
  }
}
