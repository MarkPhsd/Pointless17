import { Component, OnInit ,OnDestroy } from '@angular/core';
import { Observable, Subscription,   } from 'rxjs';
import { PollingService } from 'src/app/_services/system/polling.service';

@Component({
  selector: 'api-status-display',
  templateUrl: './api-status-display.component.html',
  styleUrls: ['./api-status-display.component.scss']
})

export class ApiStatusDisplayComponent implements OnInit, OnDestroy {

  poll$               : Observable<boolean>;
  _poll               : Subscription;
  connectedToApi      : boolean;
  apiStatus           : string;

  initSubscriptions() {
    this._poll = this.pollingService.poll$.subscribe( data => {
      this.connectedToApi = data;
      // console.log(data)
    })
  }

  constructor(private pollingService: PollingService) { }

  ngOnInit(): void {
    this.pollingService.poll();
    this.initSubscriptions()
  }

  ngOnDestroy(): void {
    if (this._poll) {
      this._poll.unsubscribe();
    }
  }
}
