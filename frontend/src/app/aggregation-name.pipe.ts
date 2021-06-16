import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../environments/environment';

/**
 * Returns the name of an aggregation, ot the key itself if the aggregation is unknown.
 */
@Pipe({
  name: 'aggregationName'
})
export class AggregationNamePipe implements PipeTransform {
  transform(value: string): string {
    return (environment.aggregationNames as { [key: string]: string })[value] || value;
  }
}
