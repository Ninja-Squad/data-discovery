import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { RareDocumentModel } from '../rare-document.model';
import { BasketService } from '../basket.service';

@Component({
  selector: 'dd-document',
  templateUrl: './rare-document.component.html',
  styleUrls: ['./rare-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RareDocumentComponent implements OnInit {

  selectedForOrdering = false;
  @Input() document: RareDocumentModel;

  constructor(private basketService: BasketService) {
  }

  ngOnInit(): void {
    this.selectedForOrdering = this.basketService.isAccessionInBasket(this.document);
  }

  addToBasket() {
    this.selectedForOrdering = true;
    this.basketService.addToBasket(this.document);
  }

  removeFromBasket() {
    this.selectedForOrdering = false;
    this.basketService.removeFromBasket(this.document);
  }
}
