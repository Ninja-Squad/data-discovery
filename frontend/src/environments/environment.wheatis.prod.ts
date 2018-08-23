import { WheatisModule } from '../app/wheatis/wheatis.module';

export const environment = {
  production: true,
  title: 'WheatIS - Wheat Information System',
  navbar: {
    title: 'WheatIS',
    links: [
      { label: 'INRA', url: 'http://www.inra.fr/' },
      { label: 'URGI', url: 'https://urgi.versailles.inra.fr/' }
    ]
  },
  resourceModule: WheatisModule,
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `WheatisAggregation` enum of the backend.
   */
  aggregationNames: {
    entry: 'Type d\'entrée',
    db: 'Base de données',
    node: 'Noeud',
    species: 'Espèce'
  }
};
