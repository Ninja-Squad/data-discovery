import { Component, OnInit } from '@angular/core';
import { environment } from "../../environments/environment";

@Component({
  selector: 'dd-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {

  joinMdFile: string = environment.joinMdFile;

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
