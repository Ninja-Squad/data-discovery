import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import { SearchService } from '../search.service';
import { GeneticResourceModel } from '../models/genetic-resource.model';
import { Page } from '../models/page';
import { map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'rare-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
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
        map(params => params.get('query')),
        tap(query => this.searchForm.get('search').setValue(query)),
        switchMap(query => this.searchService.search(query))
      )
      .subscribe(results => this.results = results);
  }

  newSearch() {
    const query = this.searchForm.get('search').value;
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {
        query
      }
    });
  }
}
