import { Injectable } from '@angular/core';
import { DiscountInfo, ClientType, OrderType, IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// https://stackoverflow.com/questions/34376854/delegation-eventemitter-or-observable-in-angular
@Injectable({
  providedIn: 'root'
})
export class PriceScheduleDataService {

  private _priceSchedule       = new BehaviorSubject<IPriceSchedule>(null);

  public priceSchedule$        = this._priceSchedule.asObservable();

  constructor() { }

  updatePriceSchedule(info: IPriceSchedule) {
    this._priceSchedule.next(info);
  }

}
