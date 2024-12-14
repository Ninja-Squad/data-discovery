import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BasketService } from '../basket.service';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { OrderableDocumentModel } from '../../../models/document.model';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { Page } from '../../../models/page';

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

  readonly documents = input.required<Page<OrderableDocumentModel>>();
  vm$: Observable<ViewModel>;

  constructor() {
    this.vm$ = toObservable(this.documents).pipe(
      switchMap(documents => {
        const accessions = documents.content.filter(document => document.accessionHolder);
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

  addAllToBasket(accessions: Array<OrderableDocumentModel>) {
    accessions.forEach(accession => this.basketService.addToBasket(accession));
  }

  removeAllFromBasket(accessions: Array<OrderableDocumentModel>) {
    accessions.forEach(accession => this.basketService.removeFromBasket(accession.identifier));
  }
}
