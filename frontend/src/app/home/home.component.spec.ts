import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HomeComponent } from './home.component';
import { SearchService } from '../search.service';
import { PillarsComponent } from '../pillars/pillars.component';
import { DocumentCountComponent } from '../document-count/document-count.component';
import { RareHeaderComponent } from '../rare/rare-header/rare-header.component';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';
import { DataDiscoveryNgbTestingModule } from '../data-discovery-ngb-testing.module';

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

  get pillarsComponent() {
    return this.debugElement.query(By.directive(PillarsComponent));
  }
}

describe('HomeComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        DataDiscoveryNgbTestingModule,
        I18nTestingModule
      ],
      declarations: [HomeComponent, PillarsComponent, DocumentCountComponent, RareHeaderComponent],
      providers: [HttpClientTestingModule]
    })
  );

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should navigate to search when a query is entered', () => {
    // given a component
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    const searchService = TestBed.inject(SearchService);

    const component = new HomeComponent(router, searchService);

    // with a query
    const query = 'Bacteria';
    const descendants = false;
    component.searchForm.get('search').setValue(query);
    // when searching
    component.search();

    // then it should redirect to the search with correct parameters
    expect(router.navigate).toHaveBeenCalledWith(['/search'], {
      queryParams: { query, descendants }
    });
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

  it('should display the pillars', () => {
    const tester = new HomeComponentTester();
    tester.detectChanges();

    expect(tester.pillarsComponent).not.toBeNull();
  });
});
