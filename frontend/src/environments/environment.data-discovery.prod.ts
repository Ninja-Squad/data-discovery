import { DataDiscoveryModule } from '../app/data-discovery/data-discovery.module';

export const environment = {
  production: true,
  title: 'DataDiscovery - Genetic and Genomic Information System',
  navbar: {
    title: 'URGI',
    logoUrl: 'https://urgi.versailles.inra.fr/',
    links: [
      { label: 'GnpIS', url: 'https://urgi.versailles.inra.fr/gnpis' },
      { label: 'About us', url: 'https://urgi.versailles.inra.fr/About-us' },
      { label: 'Help', url: '/help' }
    ]
  },
  searchPlaceholder: 'Examples: yield, fhb',
  resourceModule: DataDiscoveryModule,
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
