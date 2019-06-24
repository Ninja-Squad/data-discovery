import { DataDiscoveryModule } from '../app/data-discovery/data-discovery.module';

export const environment = {
  production: true,
  title: 'DataDiscovery - Genetic and Genomic Information System',
  navbar: {
    title: 'URGI',
    logoUrl: 'https://urgi.versailles.inra.fr/',
    links: [
      { label: 'Home', url: './' },
      { label: 'GnpIS', url: 'https://urgi.versailles.inra.fr/gnpis' }
    ]
  },
  searchPlaceholder: 'Examples: yield, fhb',
  resourceModule: DataDiscoveryModule,
  helpMdFile: 'assets/help.md',
  aboutUsMdFile: 'assets/about.md',
  joinUsMdFile: 'assets/join.md',
  legalMentionsMdFile: 'assets/legal.md',
  dataProvider: 'Data providers',
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `DataDiscoveryAggregation` enum of the backend.
   */
  aggregationNames: {
    entry: 'Data type',
    db: 'Database',
    node: 'Data provider',
    species: 'Species'
  }
};
