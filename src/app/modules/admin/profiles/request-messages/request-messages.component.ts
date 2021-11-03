import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-request-messages',
  templateUrl: './request-messages.component.html',
  styleUrls: ['./request-messages.component.scss']
})
export class RequestMessagesComponent implements OnInit {

  //list out messages.
  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
