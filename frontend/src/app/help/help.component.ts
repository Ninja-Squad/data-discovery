import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dd-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

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
