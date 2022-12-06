import { RareModule } from '../app/rare/rare.module';
import { DataDiscoveryEnvironment } from './environment.model';

export const environment: DataDiscoveryEnvironment = {
  production: false,
  name: 'brc4env',
  title: 'BRC4Env - Biological Resource Centres for the Environment of AgroBRC-RARe',
  navbar: {
    logoUrl: '',
    secondLogoUrl: '',
    links: [{ label: 'brc4env', url: 'https://www.brc4env.fr/' }]
  },
  resourceModule: RareModule,
  helpMdFile: 'assets/help.md',
  aboutUsMdFile: 'assets/about.md',
  joinUsMdFile: 'assets/join.md',
  legalMentionsMdFile: 'assets/legal.md',
  eulaMdFile: 'assets/eula.md',
  newsMdFile: 'assets/news.md',
  home: {
    showAggregations: false,
    exampleQueries: [] as Array<string>
  },
  basket: {
    enabled: true,
    url: 'http://localhost:4201/rare-basket'
  }
};
