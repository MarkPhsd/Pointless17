import { Component, Input, OnInit } from '@angular/core';
import { TranResponse, Transaction } from './../../models/models';

@Component({
  selector: 'pointlesscc-dsi-android-results',
  templateUrl: './dsi-android-results.component.html',
  styleUrls: ['./dsi-android-results.component.scss']
})
export class DsiAndroidResultsComponent implements OnInit {
  @Input() isAdmin: boolean;
  @Input() tranResponse: TranResponse;
  @Input() textResponse: string;

  constructor() { }

  ngOnInit() {
    const i = 0;
  }

}
