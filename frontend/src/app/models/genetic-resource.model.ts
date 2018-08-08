export const NULL_VALUE = 'NULL';

export interface GeneticResourceModel {
  identifier: string;
  name: string;
  description: string;
  pillarName: string;
  databaseSource: string;
  portalURL: string;
  dataURL: string;
  domain: string;
  taxon: Array<string>;
  family: Array<string>;
  genus: Array<string>;
  species: Array<string>;
  materialType: Array<string>;
  biotopeType: Array<string>;
  countryOfOrigin: string;
  originLatitude: number;
  originLongitude: number;
  countryOfCollect: string;
  collectLatitude: number;
  collectLongitude: number;
}
