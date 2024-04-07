import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-set-token',
  templateUrl: './set-token.component.html',
  styleUrls: ['./set-token.component.scss']
})
export class SetTokenComponent implements OnInit {
  pinToken        : string;
  constructor() { }

  ngOnInit(): void {
  }

  setAPIToken() {
    if (!this.pinToken) {this.pinToken = ''}
    localStorage.setItem('pinToken', this.pinToken);
    console.log(localStorage.getItem('pinToken'))
  }

}
