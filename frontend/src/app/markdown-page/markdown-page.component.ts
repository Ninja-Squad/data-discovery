import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'dd-markdown',
  templateUrl: './markdown-page.component.html',
  styleUrls: ['./markdown-page.component.scss'],
  standalone: true,
  imports: [MarkdownModule]
})
export class MarkdownPageComponent implements OnInit {
  mdFile = '';

  constructor(
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit() {
    // we extract the markdown file to display from the route data
    // and suffix it with the local (either 'en' or 'fr') to get the localized version.
    this.route.data.subscribe(
      value => (this.mdFile = value.mdFile.replace('.md', `-${this.locale.substring(0, 2)}.md`))
    );
  }
}
