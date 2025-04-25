import { OrderableDocumentModel } from '../models/document.model';

export interface GeographicLocation {
  lat: number;
  lon: number;
}

export interface FaidareDocumentModel extends OrderableDocumentModel {
  entryType: string;
  databaseName: string;
  url: string;
  species: Array<string>;
  node: string;
  annotationId: Array<string>;
  annotationName: Array<string>;
  ancestors: Array<string>;
  holdingInstitute: string;
  biologicalStatus: string;
  geneticNature: string;
  countryOfOrigin: string;
  taxonGroup: Array<string>;
  observationVariableIds: Array<string>;
  germplasmList: Array<string>;
  accessionNumber: string;
  geographicLocations: Array<GeographicLocation>;
}
