import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'dd-markdown',
  templateUrl: './markdown-page.component.html',
  styleUrls: ['./markdown-page.component.scss']
})
export class MarkdownPageComponent implements OnInit {

  mdFile: string;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
      this.route.data.subscribe(value => this.mdFile = value.mdFile);
  }

}
