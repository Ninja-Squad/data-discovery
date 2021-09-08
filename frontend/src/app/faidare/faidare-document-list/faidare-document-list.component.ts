import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Aggregation, Page } from '../../models/page';
import { DocumentModel } from '../../models/document.model';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export const ENTRY_AGGREGATION_KEY = 'entry';
export const GERMPLASM_BUCKET_KEY = 'Germplasm';

/**
 * Displays the search results for the Faidare application (by overriding the default DocumentListComponent).
 */
@Component({
  selector: 'dd-document-list',
  templateUrl: './faidare-document-list.component.html',
  styleUrls: ['./faidare-document-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareDocumentListComponent {
  @Input() documents!: Page<DocumentModel>;
  // internal subject that emits the number of germplasm documents every time the input changes
  private germplasmCount$ = new Subject<number>();
  // the VM object used in the template
  vm$: Observable<{
    // the selected tab in the navbar
    activeTab: 'germplasm' | 'all';
    // the number of germplasm documents
    germplasmCount: number;
  }>;

  constructor(private router: Router, private route: ActivatedRoute) {
    // if there is a fragment '#germplasm' in the URL, then set the Germplasm tab as the active one
    this.vm$ = combineLatest([this.route.fragment, this.germplasmCount$]).pipe(
      map(([fragment, germplasmCount]) => ({
        activeTab: fragment ? (fragment as 'all' | 'germplasm') : 'all',
        germplasmCount
      })),
      startWith({
        activeTab: 'all' as const,
        germplasmCount: 0
      })
    );
  }

  @Input()
  set aggregations(aggregations: Array<Aggregation>) {
    // if there is an aggregation named 'entry'
    const entryAggregation = aggregations.find(
      aggregation => aggregation.name === ENTRY_AGGREGATION_KEY
    );
    if (entryAggregation) {
      // with at list one document with the key 'Germplasm'
      const germplasmBucket = entryAggregation.buckets.find(
        bucket => bucket.key === GERMPLASM_BUCKET_KEY
      );
      // then we emit the new count
      this.germplasmCount$.next(germplasmBucket ? germplasmBucket.documentCount : 0);
    } else {
      // else we emit 0
      this.germplasmCount$.next(0);
    }
  }

  switchTab(newTab: 'all' | 'germplasm') {
    // we trigger a navigation with the same parameters,
    // but with a fragment '#germplasm' if we are on the germplasm tab
    const queryParams = newTab === 'germplasm' ? { entry: 'Germplasm' } : {};
    this.router.navigate(['.'], {
      relativeTo: this.route,
      fragment: newTab === 'germplasm' ? 'germplasm' : undefined,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
