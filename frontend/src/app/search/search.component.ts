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
  page = 0;
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
          if (params.get('page')) {
            this.page = +params.get('page');
          }
          // launch the search
          return this.searchService.search(this.query, this.page)
            .pipe(catchError(() => EMPTY));
        })
      )
      .subscribe(results => this.results = results);
  }

  search() {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {
        query: this.query,
        page: this.page
      }
    });
  }

  newSearch() {
    this.query = this.searchForm.get('search').value;
    this.search();
  }

  navigateToPage(nextPage: number) {
    this.page = nextPage;
    this.search();
  }
}
