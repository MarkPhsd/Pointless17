// src/app/swipe-back.service.ts
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HammerGestureConfig } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SwipeBackService {
  constructor(private location: Location) {}

  // initSwipeListener(document: Document) {
  //   const hammer = new Hammer(document.body);
  //   hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

  //   hammer.on('swipeleft', () => {
  //     this.location.back();
  //   });
  // }
}
