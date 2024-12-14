import { Pipe, PipeTransform, inject } from '@angular/core';
import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';

/**
 * Returns the translation of an aggregation key, or the key itself if the aggregation is unknown.
 */
@Pipe({
  name: 'aggregationName',
  pure: false
})
export class AggregationNamePipe implements PipeTransform {
  private translate = inject(TranslateService);

  transform(aggregationKey: string): string {
    const key = `${environment.name}.aggregation.${aggregationKey}`;
    const aggregationTranslated = this.translate.instant(key);
    // if the translation does not exist
    if (aggregationTranslated === key) {
      // return the aggregation key
      return aggregationKey;
    }
    return aggregationTranslated;
  }
}
