import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';

/**
 * Returns the translation of an aggregation key, or the key itself if the aggregation is unknown.
 */
@Pipe({
  name: 'aggregationName',
  pure: false,
  standalone: true
})
export class AggregationNamePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}
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
