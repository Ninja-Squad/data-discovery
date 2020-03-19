import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
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

  constructor(private changeDetectorRef: ChangeDetectorRef, private basketService: BasketService) {}

  ngOnInit(): void {
    this.basketService.isAccessionInBasket(this.document).subscribe(isInBasket => {
      this.selectedForOrdering = isInBasket;
      this.changeDetectorRef.markForCheck();
    });
  }

  addToBasket() {
    this.basketService.addToBasket(this.document);
  }

  removeFromBasket() {
    this.basketService.removeFromBasket(this.document.identifier);
  }
}
