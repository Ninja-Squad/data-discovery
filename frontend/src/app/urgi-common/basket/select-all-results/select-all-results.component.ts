import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { BasketService } from '../basket.service';
import { OrderableDocumentModel } from '../../../models/document.model';
import { TranslateDirective } from '@ngx-translate/core';
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
  imports: [TranslateDirective]
})
export class SelectAllResultsComponent {
  private basketService = inject(BasketService);

  readonly documents = input.required<Page<OrderableDocumentModel>>();
  readonly vm: Signal<ViewModel> = computed(() => {
    const documents = this.documents();
    const accessions = documents.content.filter(document => document.accessionHolder);
    return {
      accessions,
      allSelectedForOrdering:
        accessions.length > 0 &&
        accessions.every(accession => this.basketService.isAccessionInBasket(accession))
    };
  });

  addAllToBasket(accessions: Array<OrderableDocumentModel>) {
    accessions.forEach(accession => this.basketService.addToBasket(accession));
  }

  removeAllFromBasket(accessions: Array<OrderableDocumentModel>) {
    accessions.forEach(accession => this.basketService.removeFromBasket(accession.identifier));
  }
}
