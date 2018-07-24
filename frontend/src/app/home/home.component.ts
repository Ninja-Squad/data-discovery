import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'rare-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  searchForm: FormGroup;

  constructor(private router: Router) {
    this.searchForm = new FormGroup({
      search: new FormControl()
    });
  }

  search() {
    this.router.navigate(['/search'], {
      queryParams: {
        query: this.searchForm.get('search').value
      }
    });
  }

}
