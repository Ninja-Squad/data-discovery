import { Component, inject, LOCALE_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'dd-markdown',
  templateUrl: './markdown-page.component.html',
  styleUrl: './markdown-page.component.scss',
  imports: [MarkdownComponent]
})
export class MarkdownPageComponent {
  mdFile = '';
  private route = inject(ActivatedRoute);
  private locale = inject(LOCALE_ID);

  constructor() {
    // we extract the markdown file to display from the route data
    // and suffix it with the local (either 'en' or 'fr') to get the localized version.
    this.route.data.subscribe(
      value => (this.mdFile = value.mdFile.replace('.md', `-${this.locale.substring(0, 2)}.md`))
    );
  }
}
