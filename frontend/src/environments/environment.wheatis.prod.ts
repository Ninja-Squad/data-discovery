import { WheatisModule } from '../app/wheatis/wheatis.module';

export const environment = {
  production: true,
  title: 'WheatIS - Wheat Information System',
  navbar: {
    title: 'Wheat Initiative',
    logoUrl: 'http://www.wheatinitiative.org/',
    links: [
      { label: 'Wheat@URGI', url: 'https://wheat-urgi.versailles.inra.fr/' },
      { label: 'WheatIS website', url: 'http://wheatis.org/' }
    ]
  },
  resourceModule: WheatisModule,
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `WheatisAggregation` enum of the backend.
   */
  aggregationNames: {
    entry: 'Data type',
    db: 'Database',
    node: 'Node',
    species: 'Species'
  }
};
