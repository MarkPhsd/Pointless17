import { Injectable , OnInit, OnDestroy} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { ICompany, ISite } from   'src/app/_interfaces';
import { CompanyService } from '..';

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
import { AppInitService } from './app-init.service';
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
  sub: Subscription;
  apiUrl = '';

  constructor(
              private siteService: SitesService,
              private http: HttpClient) {

    const site = this.siteService.getAssignedSite();
    this.apiUrl = site.url;
    console.log('poll', this.apiUrl)

  }

  poll() {
    this.sub = this.timer$
      .asObservable()
      .pipe(
        switchMap((time: number) =>
          timer(time, POLLING_INTERVAL).pipe(
            // <-- start immediately, then each 10s
            concatMap(() =>
              this.http.get(`${this.apiUrl}/Companies/GetPrimaryCompany`)
            ),
            catchError(() => {
              // <-- start timer again on error
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
        },
        complete: () => console.log('Subscription complete')
      });
  }


}
