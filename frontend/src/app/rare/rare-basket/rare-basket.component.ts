import { Component, Inject, OnInit } from '@angular/core';
import { Basket, BasketService } from '../basket.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LOCATION } from '../rare.module';
import { rareBasket } from '../../../environments/rare-basket';

@Component({
  // the selector is not a custom element as usual
  // but a simple div, so we can add it in the navbar
  // without disturbing the other applications.
  // tslint:disable-next-line:component-selector
  selector: 'div.navbar-rare-basket',
  templateUrl: './rare-basket.component.html',
  styleUrls: ['./rare-basket.component.scss']
})
export class RareBasketComponent implements OnInit {
  itemCounter = 0;
  basket: Basket;

  constructor(private basketService: BasketService, private modalService: NgbModal, @Inject(LOCATION) private location: Location) {}

  ngOnInit(): void {
    this.basketService.getBasket().subscribe((basket: Basket) => {
      this.itemCounter = basket.items.length;
      this.basket = basket;
    });
  }

  viewItems(basket: any) {
    if (this.itemCounter > 0) {
      this.modalService.open(basket, { ariaLabelledBy: 'modal-title', size: 'lg', scrollable: true }).result.then(
        () => {
          // trigger an sendBasket on rare-basket
          this.basketService.sendBasket().subscribe(basketCreated => {
            this.location.assign(`${rareBasket.url}/baskets/${basketCreated.reference}`);
          });
        },
        () => {}
      );
    }
  }

  removeItemFromBasket(item: string) {
    this.basketService.removeFromBasket(item);
  }
}
