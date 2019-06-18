import { Component, OnInit } from '@angular/core';
import { environment } from "../../environments/environment";

@Component({
  selector: 'dd-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  aboutMdFile: string = environment.aboutUsMdFile;

  constructor() {
  }

  ngOnInit() {
  }

  onLoad(e: any) {
    // console.log('Into onLoad');
    // console.log(e);
  }

  onError(e: any) {
    console.log('Got error', e);
  }

}
