export const NULL_VALUE = 'NULL';
export const NULL_VALUE_TRANSLATION_KEY = 'large-aggregation.none';

export interface DocumentModel {
  identifier: string;
  name: string;
  description: string;
}

export interface OrderableDocumentModel extends DocumentModel {
  accessionHolder: string | null;
}
