export interface Page<T> {
  content: Array<T>;
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  maxResults: number;
}

export interface Bucket {
  key: string;
  documentCount: number;
}

export interface Aggregation {
  name: string;
  buckets: Array<Bucket>;
}

export interface AggregatedPage<T> extends Page<T> {
  aggregations: Array<Aggregation>;
}
