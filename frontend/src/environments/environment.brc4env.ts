import { RareModule } from '../app/rare/rare.module';
import { DataDiscoveryEnvironment } from './environment.model';

export const environment: DataDiscoveryEnvironment = {
  production: false,
  title: 'BRC4Env - Biological Resource Centre for the Environment',
  navbar: {
    title: 'BRC4Env Search',
    logoUrl: '',
    links: [{ label: 'BRC4Env Home', url: 'https://www.brc4env.fr/' }]
  },
  searchPlaceholder: 'e.g. salmo, chlamydomonas, phytomyzinae',
  resourceModule: RareModule,
  helpMdFile: 'assets/help.md',
  aboutUsMdFile: 'assets/about.md',
  joinUsMdFile: 'assets/join.md',
  legalMentionsMdFile: 'assets/legal.md',
  eulaMdFile: 'assets/eula.md',
  newsMdFile: 'assets/news.md',
  dataProvider: 'Data providers',
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `RareAggregation` enum of the backend.
   */
  aggregationNames: {
    coo: "Pays d'origine",
    coc: 'Pays de collecte',
    domain: 'Domaine',
    material: 'Matériel',
    taxon: 'Taxon',
    biotope: 'Biotope'
  }
};
