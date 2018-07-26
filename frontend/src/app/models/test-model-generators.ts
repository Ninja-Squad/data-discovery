import { Page } from './page';
import { GeneticResourceModel } from './genetic-resource.model';

export function toSinglePage<T>(content: Array<T>): Page<T> {
  return {
    content,
    number: 0,
    size: 20,
    totalElements: content.length,
    totalPages: 1
  };
}

export function toSecondPage<T>(content: Array<T>): Page<T> {
  return {
    content,
    number: 1,
    size: 20,
    totalElements: 20 + content.length,
    totalPages: 2
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
