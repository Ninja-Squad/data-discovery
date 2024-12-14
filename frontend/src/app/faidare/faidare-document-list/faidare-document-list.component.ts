import { ChangeDetectionStrategy, Component } from '@angular/core';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { Model, SearchCriteria, SearchStateService } from '../../search-state.service';
import { AggregationCriterion } from '../../models/aggregation-criterion';
import { DocumentModel } from '../../models/document.model';
import { Page } from '../../models/page';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavLink,
  NgbNavOutlet
} from '@ng-bootstrap/ng-bootstrap';
import { GermplasmResultsComponent } from '../germplasm-results/germplasm-results.component';
import { environment } from '../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

const ENTRY_AGGREGATION_KEY = 'entry';
const GERMPLASM_BUCKET_KEY = 'Germplasm';

interface ViewModel {
  documents: Page<DocumentModel> | null;
  // the selected tab in the navbar
  activeTab: 'germplasm' | 'all';
  // the number of germplasm documents
  germplasmCount: number;
}

function toGermplasmOnlyAggregationCriteria(aggregationCriteria: Array<AggregationCriterion>) {
  const newAggregationCriteria = aggregationCriteria.filter(
    criterion => criterion.name !== ENTRY_AGGREGATION_KEY
  );
  newAggregationCriteria.push({
    name: ENTRY_AGGREGATION_KEY,
    values: [GERMPLASM_BUCKET_KEY]
  });
  return newAggregationCriteria;
}

// public to be tested
export function toGermplasmTransition(criteria: SearchCriteria): SearchCriteria {
  return {
    ...criteria,
    page: 1,
    aggregationCriteria: toGermplasmOnlyAggregationCriteria(criteria.aggregationCriteria),
    sortCriterion: null,
    fragment: 'germplasm'
  };
}

export function toAllTransition(criteria: SearchCriteria): SearchCriteria {
  return {
    ...criteria,
    page: 1,
    sortCriterion: null,
    fragment: null
  };
}

/**
 * Displays the search results for the Faidare application (by overriding the default DocumentListComponent).
 */
@Component({
    selector: 'dd-document-list',
    templateUrl: './faidare-document-list.component.html',
    styleUrl: './faidare-document-list.component.scss',
    imports: [
        AsyncPipe,
        NgTemplateOutlet,
        NgbNav,
        NgbNavItem,
        NgbNavLink,
        NgbNavContent,
        NgbNavOutlet,
        TranslateModule,
        GermplasmResultsComponent,
        environment.documentComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareDocumentListComponent {
  // the VM object used in the template
  vm$: Observable<ViewModel>;

  constructor(private searchStateService: SearchStateService) {
    // if there is a fragment '#germplasm' in the URL, then set the Germplasm tab as the active one
    this.vm$ = searchStateService.getModel().pipe(
      map(model => {
        const germplasmCount = this.findGermplasmCount(model);
        return {
          documents: model.documents,
          activeTab:
            model.searchCriteria.fragment === 'germplasm' && germplasmCount > 0
              ? 'germplasm'
              : 'all',
          germplasmCount
        };
      })
    );

    this.vm$
      .pipe(
        map(vm => vm.activeTab),
        distinctUntilChanged()
      )
      .subscribe(activeTab => {
        searchStateService.disableAggregation(
          activeTab === 'germplasm' ? ENTRY_AGGREGATION_KEY : null
        );
      });
  }

  private findGermplasmCount(model: Model): number {
    return (
      model.aggregations
        .find(aggregation => aggregation.name === ENTRY_AGGREGATION_KEY)
        ?.buckets?.find(bucket => bucket.key === GERMPLASM_BUCKET_KEY)?.documentCount ?? 0
    );
  }

  switchTab(newTab: 'all' | 'germplasm') {
    if (newTab === 'all') {
      this.searchStateService.applyTransition(toAllTransition);
    } else {
      this.searchStateService.applyTransition(toGermplasmTransition);
    }
  }
}
