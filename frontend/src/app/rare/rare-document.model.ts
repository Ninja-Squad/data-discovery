import { DocumentModel } from '../models/document.model';

interface Location {
  lat: number;
  lon: number;
}

export interface RareDocumentModel extends DocumentModel {
  pillarName: string;
  databaseSource: string;
  portalURL: string;
  dataURL: string | null;
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
  accessionHolder: string;
}
