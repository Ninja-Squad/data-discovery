import { GnpisModule } from '../app/gnpis/gnpis.module';

export const environment = {
  production: true,
  title: 'GnpIS - Genetic and Genomic Information System',
  navbar: {
    title: 'GnpIS',
    links: [
      { label: 'INRA', url: 'http://www.inra.fr/' },
      { label: 'URGI', url: 'https://urgi.versailles.inra.fr/' }
    ]
  },
  resourceModule: GnpisModule,
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `GnpisAggregation` enum of the backend.
   */
  aggregationNames: {
    entry: 'Type d\'entrée',
    db: 'Base de données',
    node: 'Noeud',
    species: 'Espèce'
  }
};
