import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'dd-markdown',
  templateUrl: './markdown-page.component.html',
  styleUrls: ['./markdown-page.component.scss']
})
export class MarkdownPageComponent implements OnInit {

  mdFile: string;

  constructor(private route: ActivatedRoute, @Inject(LOCALE_ID) private locale: 'en' | 'fr') {
  }

  ngOnInit() {
    // we extract the markdown file to display from the route data
    // and suffix it with the local (either 'en' or 'fr') to get the localized version.
    this.route.data.subscribe(value => this.mdFile = value.mdFile.replace('.md', `-${this.locale}.md`));
  }

}
