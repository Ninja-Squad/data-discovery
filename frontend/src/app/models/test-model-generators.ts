import { AggregatedPage, Aggregation, Bucket } from './page';
import { AggregationCriterion } from './aggregation-criterion';
import { RareGeneticResourceModel } from '../rare/rare-genetic-resource.model';
import { WheatisGeneticResourceModel } from '../wheatis/wheatis-genetic-resource.model';

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

export function toRareGeneticResource(name: string): RareGeneticResourceModel {
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
    locationOfOrigin: {
      lat: 45.7542224,
      lon: 4.8298569
    },
    countryOfCollect: 'France',
    locationOfCollect: {
      lat: 45.7542224,
      lon: 4.8298569
    }
  };
}

export function toWheatisGeneticResource(name: string): WheatisGeneticResourceModel {
  return {
    identifier: name,
    name,
    url: 'http://brc4env.fr',
    description: 'A description of the genetic geneticResource',
    databaseName: 'BRC4Env',
    node: 'Node',
    species: [`${name} species`, `${name} species2`],
    entryType: 'Specimen'
  };
}
