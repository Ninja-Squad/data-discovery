/**
 * Map containing the list of the aggregations and their displayed name.
 * Should be kept in sync with the `RareAggregation` enum of the backend.
 */
export const aggregationNames: { [key: string]: string } = {
  coo: 'Pays d\'origine',
  coc: 'Pays de collecte',
  domain: 'Domaine',
  material: 'Matériel',
  taxon: 'Taxon',
  biotope: 'Biotope',
};
