import { GeneticResourceModel } from '../models/genetic-resource.model';

export interface WheatisGeneticResourceModel extends GeneticResourceModel {
  url: string;
  species: Array<string>;
  entryType: string;
  databaseName: string;
  node: string;
}
