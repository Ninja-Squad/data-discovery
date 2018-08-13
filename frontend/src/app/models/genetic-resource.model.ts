export const NULL_VALUE = 'NULL';

export interface Location {
  lat: number;
  lon: number;
}

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
  locationOfOrigin: Location;
  countryOfCollect: string;
  locationOfCollect: Location;
}
