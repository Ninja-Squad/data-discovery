import { DataDiscoveryEnvironment } from './environment.model';
import { RareDocumentComponent } from '../app/rare/rare-document/rare-document.component';
import { GenericDocumentListComponent } from '../app/urgi-common/generic-document-list/generic-document-list.component';
import { RareHeaderComponent } from '../app/rare/rare-header/rare-header.component';
import { GenericOntologyAggregationComponent } from '../app/urgi-common/generic-ontology-aggregation/generic-ontology-aggregation.component';
import { GenericFooterComponent } from '../app/urgi-common/generic-footer/generic-footer.component';
import { BasketComponent } from '../app/urgi-common/basket/basket/basket.component';
import { SelectAllResultsComponent } from '../app/urgi-common/basket/select-all-results/select-all-results.component';

export const environment: DataDiscoveryEnvironment = {
  production: false,
  name: 'brc4env',
  title: 'BRC4Env - Biological Resource Centres for the Environment of AgroBRC-RARe',
  navbar: {
    logoUrl: '',
    secondLogoUrl: '',
    links: [{ label: 'brc4env', url: 'https://www.brc4env.fr/' }]
  },
  documentComponent: RareDocumentComponent,
  documentListComponent: GenericDocumentListComponent,
  ontologyAggregationComponent: GenericOntologyAggregationComponent,
  headerComponent: RareHeaderComponent,
  footerComponent: GenericFooterComponent,
  basketComponent: BasketComponent,
  selectAllResultsComponent: SelectAllResultsComponent,
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
