import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SplashScreenStateService {

  subject = new Subject();

  constructor() { }

  subscribe(onNext): Subscription {
     return this.subject.subscribe(onNext);
  }

  stop() {
     this.subject.next(false);
  }

  start() {
    this.subject.next(true);
 }

}

