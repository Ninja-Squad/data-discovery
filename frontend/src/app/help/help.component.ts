import { Component, OnInit } from '@angular/core';
import { environment } from "../../environments/environment";

@Component({
  selector: 'dd-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  helpMdFile: string = environment.helpMdFile;

  constructor() { }

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
