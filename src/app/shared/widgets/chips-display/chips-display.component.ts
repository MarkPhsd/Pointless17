import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chips-display',
  templateUrl: './chips-display.component.html',
  styleUrls: ['./chips-display.component.scss']
})
export class ChipsDisplayComponent implements OnInit {

  @Input() items: string;
  itemTags: string[];

  constructor(
  ) {

  }

  ngOnInit() {
    this.initMetaTags(this.items)
  }

  initMetaTags(items: string){
    if ( items ) {
      this.itemTags = items.split(',')
    }
  }
}
