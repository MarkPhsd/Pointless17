import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ionic-swipe-to-delete',
  templateUrl: './ionic-swipe-to-delete.component.html',
  styleUrls: ['./ionic-swipe-to-delete.component.scss']
})
export class IonicSwipeToDeleteComponent implements OnInit {

  items: any[];
  item: any;

  constructor() { }

  ngOnInit(): void {
    console.log('what')
  }

  favorite(item) {
    console.log(item)
  }

  unread(item) {
    console.log(item)
  }

  share(item) {
    console.log(item)
  }
}
