import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TranslateDirective } from '@ngx-translate/core';

interface DataProvider {
  name: string;
  url: string;
}

@Component({
  selector: 'dd-footer',
  templateUrl: './faidare-footer.component.html',
  styleUrl: './faidare-footer.component.scss',
  imports: [TranslateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareFooterComponent {
  dataProviders: Array<DataProvider> = [
    {
      name: 'URGI GnpIS',
      url: 'https://urgi.versailles.inrae.fr/gnpis'
    },
    {
      name: 'WUR EU-SOL BreeDB',
      url: 'https://www.eu-sol.wur.nl'
    },
    {
      name: 'VIB PIPPA',
      url: 'http://pippa.psb.ugent.be'
    },
    {
      name: 'IBET BioData',
      url: 'https://biodata.pt'
    },
    {
      name: 'NIB PISA',
      url: 'http://www.pisa.nib.si'
    },
    {
      name: 'CIRAD TropGENE',
      url: 'http://tropgenedb.cirad.fr'
    },
    {
      name: 'EBI European Nucleotide Archive',
      url: 'https://www.ebi.ac.uk/eva'
    },
    {
      name: 'TERRA-REF',
      url: 'https://terraref.org'
    }
  ];
}
