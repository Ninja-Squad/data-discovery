import { WheatisModule } from '../app/wheatis/wheatis.module';

export const environment = {
  production: true,
  title: 'WheatIS - Wheat Information System',
  navbar: {
    title: 'Wheat Initiative',
    logoUrl: 'http://www.wheatinitiative.org/',
    links: [
      { label: 'Home', url: './' },
      { label: 'WheatIS website', url: 'http://wheatis.org/' },
      { label: 'Wheat@URGI', url: 'https://wheat-urgi.versailles.inra.fr/' }
    ]
  },
  searchPlaceholder: 'Examples: yield, fhb',
  resourceModule: WheatisModule,
  helpMdFile: 'assets/help.md',
  aboutUsMdFile: 'assets/about.md',
  joinUsMdFile: 'assets/join.md',
  legalMentionsMdFile: 'assets/legal.md',
  dataProvider: 'Data providers',
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `WheatisAggregation` enum of the backend.
   */
  aggregationNames: {
    entry: 'Data type',
    db: 'Database',
    node: 'Data provider',
    species: 'Species'
  }
};
