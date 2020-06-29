import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Page } from '../../models/page';
import { RareDocumentModel } from '../rare-document.model';
import { BasketService } from '../basket.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'dd-select-all-results',
  templateUrl: './rare-select-all-results.component.html',
  styleUrls: ['./rare-select-all-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RareSelectAllResultsComponent {
  private accessions: Array<RareDocumentModel> = [];
  allSelectedForOrdering = false;
  counter = 0;

  constructor(private changeDetectorRef: ChangeDetectorRef, private basketService: BasketService) {}

  @Input()
  set documents(documents: Page<RareDocumentModel>) {
    if (documents) {
      this.accessions = documents.content
        // we only keep the accession with an accession holder
        .filter(accession => accession.accessionHolder);
      this.counter = this.accessions.length;
      combineLatest(this.accessions.map(document => this.basketService.isAccessionInBasket(document)))
        .pipe(map(areAccessionsInBasket => areAccessionsInBasket.every(isAccessionInBasket => isAccessionInBasket)))
        .subscribe(areInBasket => {
          this.allSelectedForOrdering = areInBasket;
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.accessions = [];
      this.counter = 0;
    }
  }

  addAllToBasket() {
    this.accessions.map(accession => this.basketService.addToBasket(accession));
  }

  removeAllFromBasket() {
    this.accessions.map(accession => this.basketService.removeFromBasket(accession.identifier));
  }
}
