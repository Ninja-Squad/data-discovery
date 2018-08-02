import { AggregatedPage, Aggregation, Bucket } from './page';
import { GeneticResourceModel } from './genetic-resource.model';
import { AggregationCriterion } from './aggregation-criterion';

export function toSinglePage<T>(content: Array<T>, aggregations?: Array<Aggregation>): AggregatedPage<T> {
  return {
    content,
    number: 0,
    size: 20,
    totalElements: content.length,
    totalPages: 1,
    maxResults: 10000,
    aggregations: aggregations || []
  };
}

export function toSecondPage<T>(content: Array<T>, aggregations?: Array<Aggregation>): AggregatedPage<T> {
  return {
    content,
    number: 1,
    size: 20,
    totalElements: 20 + content.length,
    totalPages: 2,
    maxResults: 10000,
    aggregations: aggregations || []
  };
}

export function toAggregation(name: string, values: Array<string>): Aggregation {
  // creates a bucket for each value, with a document count of (index+1)*10
  const buckets: Array<Bucket> = values.map((key, index) => ({ key, documentCount: (index + 1) * 10 }));
  return {
    name,
    buckets,
    type: 'SMALL'
  };
}

export function toAggregationCriterion(name: string, values: Array<string>): AggregationCriterion {
  return {
    name,
    values
  };
}

export function toGeneticResource(name: string): GeneticResourceModel {
  return {
    identifier: name,
    name,
    description: 'A description of the genetic geneticResource',
    pillarName: 'Plant',
    databaseSource: 'BRC4Env',
    portalURL: 'http://brc4env.fr',
    dataURL: `http://brc4env.fr/${name}`,
    domain: 'Plantae',
    taxon: [`${name} taxon1`, `${name} taxon2`],
    family: [`${name} family`],
    genus: [`${name} genus`],
    species: [`${name} species`],
    materialType: ['Specimen'],
    biotopeType: ['Plant host'],
    countryOfOrigin: 'France',
    originLatitude: 45.7542224,
    originLongitude: 4.8298569,
    countryOfCollect: 'France',
    collectLatitude: 45.7542224,
    collectLongitude: 4.8298569
  };
}
