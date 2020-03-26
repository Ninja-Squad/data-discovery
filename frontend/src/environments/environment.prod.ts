import { RareModule } from '../app/rare/rare.module';

export const environment = {
  production: true,
  title: 'RARe - Ressources Agronomiques pour la Recherche',
  navbar: {
    title: 'RARe Search',
    logoUrl: '',
    links: [
      { label: 'AgroBRC-RARe Home', url: 'https://www.agrobrc-rare.org/' }
    ]
  },
  searchPlaceholder: 'Examples: yield, fhb',
  resourceModule: RareModule,
  helpMdFile: 'assets/help.md',
  aboutUsMdFile: 'assets/about.md',
  joinUsMdFile: 'assets/join.md',
  legalMentionsMdFile: 'assets/legal.md',
  dataProvider: 'Data providers',
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `RareAggregation` enum of the backend.
   */
  aggregationNames: {
    coo: 'Pays d\'origine',
    coc: 'Pays de collecte',
    domain: 'Domaine',
    material: 'Matériel',
    taxon: 'Taxon',
    biotope: 'Biotope'
  },
  rareBasket: 'http://localhost:4201'
};
