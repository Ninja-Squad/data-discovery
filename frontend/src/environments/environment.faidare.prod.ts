import { FaidareModule } from '../app/faidare/faidare.module';

export const environment = {
  production: true,
  title: 'DataDiscovery - Genetic and Genomic Information System',
  navbar: {
    title: 'URGI',
    logoUrl: 'https://urgi.versailles.inrae.fr/',
    links: [
      { label: 'Home', url: './' },
      { label: 'GnpIS', url: 'https://urgi.versailles.inrae.fr/gnpis' }
    ]
  },
  searchPlaceholder: 'Examples: yield, fhb',
  resourceModule: FaidareModule,
  helpMdFile: 'assets/help.md',
  aboutUsMdFile: 'assets/about.md',
  joinUsMdFile: 'assets/join.md',
  legalMentionsMdFile: 'assets/legal.md',
  newsMdFile: 'assets/news.md',
  eulaMdFile: 'assets/eula.md',
  dataProvider: 'Data providers',
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `FaidareAggregation` enum of the backend.
   */
  aggregationNames: {
    entry: 'Data type',
    db: 'Database',
    node: 'Data provider',
    species: 'Species',
    annot: 'Ontology annotation',
    hi: 'Holding institute',
    bs: 'Biological status',
    gn: 'Genetic nature',
    coo: 'Country of origin',
    tg: 'Taxon group'
  }
};
