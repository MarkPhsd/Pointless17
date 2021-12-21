import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {
  Subscription,
  BehaviorSubject,
  ReplaySubject,
  timer,
  NEVER
} from 'rxjs';
import {
  takeWhile,
  takeUntil,
  catchError,
  concatMap,
  switchMap,
  tap
} from 'rxjs/operators';

import { SitesService } from '../reporting/sites.service';

export const POLLING_INTERVAL  = (60 * 1000) * 1;                   // <-- poll every 1 min

// https://makeitnew.io/polling-using-rxjs-8347d05e9104
// https://stackoverflow.com/questions/68288286/how-to-call-api-every-10sec-based-on-status-response-in-angular-11

@Injectable({
  providedIn: 'root'
})

export class PollingService   {

  timer$            = new BehaviorSubject<number>(0);    // <-- initially call immediately
  close$            = new ReplaySubject<any>(1);         // <-- close open subscriptions
  sub               : Subscription;
  apiUrl             = '';

  private _poll          = new BehaviorSubject<boolean>(null);
  public poll$           = this._poll.asObservable();

  constructor(
              private siteService: SitesService,
              private http: HttpClient) {
  }

  getCurrentUrl() {
    let site = this.siteService.getAssignedSite();
    this.apiUrl = site.url;
    if (this.apiUrl == undefined) {
      this.siteService.setDefaultSite()
    }
    site = this.siteService.getAssignedSite();
    this.apiUrl = site.url;
    return site;
  }

  poll() {
    this.sub = this.timer$
      .asObservable()
      .pipe(
        switchMap((time: number) =>
          timer(time, POLLING_INTERVAL).pipe(
            // <-- start immediately, then each 10s
            concatMap(() =>{
              //make sure we always have the current url;
              this.getCurrentUrl()
              // console.log('this.apiUrl', this.getCurrentUrl())
              return this.http.get(`${this.apiUrl}/Companies/GetPrimaryCompany`)
            }
            ),
            catchError(() => {
              // <-- start timer again on error
              this._poll.next(false)
              console.log('Subscription failed');
              this.timer$.next(POLLING_INTERVAL);
              return NEVER; // <-- don't forward errors
            })
          )
        ),
        takeUntil(this.close$)
      )
      .subscribe({
        next: (data: any) => {
          console.log('Subscription next');
          this._poll.next(true)
        },
        complete: () => console.log('Subscription complete')
      }),  catchError => {
        console.log('Subscription failed');
        this._poll.next(false)
      };
  }


}
