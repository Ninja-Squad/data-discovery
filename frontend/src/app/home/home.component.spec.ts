import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';

import { HomeComponent } from './home.component';

class HomeComponentTester extends ComponentTester<HomeComponent> {
  constructor() {
    super(HomeComponent);
  }

  get searchBar() {
    return this.input('input');
  }

  get searchButton() {
    return this.button('button');
  }
}

describe('HomeComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, RouterTestingModule],
    declarations: [HomeComponent]
  }));

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should navigate to search when a query is entered', () => {
    // given a component
    const router = TestBed.get(Router) as Router;
    spyOn(router, 'navigate');
    const component = new HomeComponent(router);

    // with a query
    const query = 'Bacteria';
    component.searchForm.get('search').setValue(query);
    // when searching
    component.search();

    // then it should redirect to the search with correct parameters
    expect(router.navigate).toHaveBeenCalledWith(['/search'], { queryParams: { query } });
  });

  it('should display a search bar and trigger a search', () => {
    // given a component
    const tester = new HomeComponentTester();
    const component = tester.componentInstance;
    spyOn(component, 'search');

    // then it should display the search bar containing that query
    tester.detectChanges();

    expect(tester.searchBar).toHaveValue('');

    // with a query
    const query = 'Bacteria';
    tester.searchBar.fillWith(query);

    // trigger search
    tester.searchButton.click();
    expect(component.search).toHaveBeenCalled();
    expect(component.searchForm.get('search').value).toBe(query);
  });
});
