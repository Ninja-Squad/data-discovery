import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../environments/environment';

@Component({
  selector: 'dd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(title: Title) {
    title.setTitle(environment.title);
  }
}
