import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { SearchService } from '../search.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'dd-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  searchForm: FormGroup;
  placeholder = environment.searchPlaceholder;
  suggesterTypeahead: (text$: Observable<string>) => Observable<Array<string>>;

  constructor(private router: Router, private searchService: SearchService) {
    this.searchForm = new FormGroup({
      search: new FormControl()
    });
    this.suggesterTypeahead = this.searchService.getSuggesterTypeahead();
  }

  search() {
    this.router.navigate(['/search'], {
      queryParams: {
        query: this.searchForm.get('search')!.value,
        descendants: false
      }
    });
  }
}
