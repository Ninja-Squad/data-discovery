import { DocumentModel } from '../models/document.model';

export interface WheatisGnpisDocumentModel extends DocumentModel {
  url: string;
  species: Array<string>;
  entryType: string;
  databaseName: string;
  node: string;
}
