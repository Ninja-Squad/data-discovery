import { Pipe, PipeTransform } from '@angular/core';

import { aggregationNames } from './models/aggregation-names';

/**
 * Returns the name of an aggregation, ot the key itself if the aggregation is unknown.
 */
@Pipe({
  name: 'aggregationName'
})
export class AggregationNamePipe implements PipeTransform {

  transform(value: string, args?: any): string {
    return aggregationNames[value] || value;
  }

}
