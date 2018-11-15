import { DocumentModel } from '../models/document.model';

export interface GnpisDocumentModel extends DocumentModel {
  url: string;
  species: Array<string>;
  entryType: string;
  databaseName: string;
  node: string;
}
