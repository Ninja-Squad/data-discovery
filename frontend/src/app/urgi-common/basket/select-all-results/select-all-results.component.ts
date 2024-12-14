import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { Page } from '../../../models/page';
import { BasketService } from '../basket.service';
import { BehaviorSubject, combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { OrderableDocumentModel } from '../../../models/document.model';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';

interface ViewModel {
  allSelectedForOrdering: boolean;
  accessions: Array<OrderableDocumentModel>;
}

@Component({
    selector: 'dd-select-all-results',
    templateUrl: './select-all-results.component.html',
    styleUrl: './select-all-results.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule, AsyncPipe]
})
export class SelectAllResultsComponent {
  private basketService = inject(BasketService);

  vm$: Observable<ViewModel>;
  private documentsSubject = new BehaviorSubject<Array<OrderableDocumentModel>>([]);

  constructor() {
    this.vm$ = this.documentsSubject.pipe(
      switchMap(documents => {
        const accessions = documents.filter(document => document.accessionHolder);
        if (accessions.length === 0) {
          return of({
            accessions,
            allSelectedForOrdering: false
          });
        } else {
          return combineLatest(
            accessions.map(accession => this.basketService.isAccessionInBasket(accession))
          ).pipe(
            map(areAccessionsInBasket => ({
              accessions,
              allSelectedForOrdering: areAccessionsInBasket.every(
                isAccessionInBasket => isAccessionInBasket
              )
            }))
          );
        }
      })
    );
  }

  @Input()
  set documents(documents: Page<OrderableDocumentModel> | null) {
    this.documentsSubject.next(documents?.content ?? []);
  }

  addAllToBasket(accessions: Array<OrderableDocumentModel>) {
    accessions.forEach(accession => this.basketService.addToBasket(accession));
  }

  removeAllFromBasket(accessions: Array<OrderableDocumentModel>) {
    accessions.forEach(accession => this.basketService.removeFromBasket(accession.identifier));
  }
}
