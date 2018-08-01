export interface DatabaseSourceModel {
  name: string;
  documentCount: number;
  url: string;
}

export interface PillarModel {
  name: string;
  databaseSources: Array<DatabaseSourceModel>;
}
