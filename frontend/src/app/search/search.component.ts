import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { SearchService } from '../search.service';
import { GeneticResourceModel } from '../models/genetic-resource.model';
import { Page } from '../models/page';

@Component({
  selector: 'rare-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  query = '';
  searchForm: FormGroup;
  results: Page<GeneticResourceModel>;

  constructor(private route: ActivatedRoute, private router: Router, private searchService: SearchService) {
    this.searchForm = new FormGroup({
      search: new FormControl()
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        // extract query parameters
        switchMap(params => {
          this.query = params.get('query');
          // set the search field
          this.searchForm.get('search').setValue(this.query);
          let page = 1;
          if (params.get('page')) {
            page = +params.get('page');
          }
          // launch the search
          return this.searchService.search(this.query, page)
            .pipe(catchError(() => EMPTY));
        })
      )
      .subscribe(results => this.results = results);
  }

  /**
   * Method called when the user enters a new value in the search field and submits the search form.
   * It uses the new search terms in the form, and asks for the default page (1) for this new query
   */
  newSearch() {
    this.query = this.searchForm.get('search').value;
    this.search();
  }

  /**
   * Method called when the user navigates to a different page using the pagination. It uses the current query
   * and navigates to the requested page.
   */
  navigateToPage(requestedPage: number) {
    this.search(requestedPage);
  }

  private search(page?: number) {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {
        query: this.query,
        page
      }
    });
  }
}
