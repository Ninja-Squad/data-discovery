import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Page } from '../../../models/page';
import { BasketService } from '../basket.service';
import { BehaviorSubject, combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { OrderableDocumentModel } from '../../../models/document.model';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, AsyncPipe } from '@angular/common';

interface ViewModel {
  allSelectedForOrdering: boolean;
  accessions: Array<OrderableDocumentModel>;
}

@Component({
  selector: 'dd-select-all-results',
  templateUrl: './select-all-results.component.html',
  styleUrl: './select-all-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgSwitch, NgSwitchCase, TranslateModule, NgSwitchDefault, AsyncPipe]
})
export class SelectAllResultsComponent {
  vm$: Observable<ViewModel>;
  private documentsSubject = new BehaviorSubject<Array<OrderableDocumentModel>>([]);

  constructor(private basketService: BasketService) {
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
