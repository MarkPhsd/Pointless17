import { CommonModule } from '@angular/common';
import { Component, OnInit ,OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subscription,   } from 'rxjs';
import { PollingService } from 'src/app/_services/system/polling.service';

@Component({
  selector: 'api-status-display',
  standalone: true,
  imports: [CommonModule,MatIconModule,],
  templateUrl: './api-status-display.component.html',
  styleUrls: ['./api-status-display.component.scss']
})

export class ApiStatusDisplayComponent implements OnInit, OnDestroy {

  @ViewChild('connectionError') connectionError: TemplateRef<any>;

  poll$               : Observable<boolean>;
  _poll               : Subscription;
  connectedToApi      : boolean;
  apiStatus           : string;
  initApp             = true
  pollOnce$          : Observable<any>;

  initSubscriptions() {

    this._poll = this.pollingService.poll$.subscribe( data => {
      this.connectedToApi = data;
    })
  }

  constructor(private pollingService: PollingService) { }

  ngOnInit(): void {
    this.connectedToApi = true;
    this.pollOnce$ = this.pollingService.pollOnce()
    setTimeout( data => {
      this.pollingService.poll();
      this.initSubscriptions()
      this.initApp = false;
    }, 5000)
  }

  ngOnDestroy(): void {
    if (this._poll) {
      this._poll.unsubscribe();
    }
  }

  get  isError() {
    if (!this.connectedToApi) {
     return this.connectionError
    }
    return null;
  }
}
