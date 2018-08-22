import { GeneticResourceModel } from '../models/genetic-resource.model';

export interface Location {
  lat: number;
  lon: number;
}

export interface RareGeneticResourceModel extends GeneticResourceModel {
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
