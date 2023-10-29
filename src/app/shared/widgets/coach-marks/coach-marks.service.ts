import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { CoachMarksComponent } from './coach-marks.component';

export class CoachMarksClass {
  componentHTML: HTMLElement;
  text: string;
  constructor(componentHTML: HTMLElement, text: string) {
    this.componentHTML = componentHTML;
    this.text = text;
  }
}

@Injectable({
  providedIn: 'root',
})
export class CoachMarksService {
  popovers = [];
  currentPopover = 0;

  constructor(public popoverController: PopoverController) {}

  clear() {
    this.popovers = []
  }

  add(component: CoachMarksClass) {
    var _this = this;
    let handler = function (event: Event) {
      _this.popovers.push({
        component: CoachMarksComponent,
        backdropDismiss: false,
        componentProps: {
          text: component.text,
          index: _this.popovers.length,
          isTheLast: false,
          isTheFirst: true,
        },
        event: event,
        cssClass: 'ion-popover-class',
        mode: 'ios',
      });
      component.componentHTML.removeEventListener('event', handler, false);
    };
    component.componentHTML.addEventListener('event', handler, false);
    component.componentHTML.dispatchEvent(new Event('event'));
  }

  showCurrentPopover() {
    //put the last popover how the last. Only the fist time.
    if (this.currentPopover === 0) {
      this.popovers[this.popovers.length - 1].componentProps.isTheLast = true;
    }
    if (this.currentPopover === 0) {
      this.popovers[this.popovers.length - 1].componentProps.isTheFirst = true;
    }

    this.popoverController
      .create(this.popovers[this.currentPopover])
      .then((popover) => {
        popover.onDidDismiss().then((data) => {
          if (data && data.data && data.data === 'next') {
            this.currentPopover = this.currentPopover + 1;
            this.showCurrentPopover();
          }
          if (data && data.data && data.data === 'close') {
            this.popovers = [];
            this.currentPopover = 0;
          }
          if (data && data.data && data.data === 'previous') {
            // this.popovers = [];
            console.log('previous?')
            if (this.currentPopover != 0) {
              this.currentPopover = this.currentPopover - 1;
            }
            this.showCurrentPopover();

          }
        });
        popover.present();
      });
  }

  navPopoverByIndex(index: number) {
    // console.log('index', index);
    // let popover = this.popovers[this.currentPopover];
    this.popoverController
      .create(this.popovers[this.currentPopover])
      .then((popover) => {
        popover.onDidDismiss().then((data) => {
          this.currentPopover = index;
          // console.log('show popover');
          this.showCurrentPopover();
          popover.present();
        });
      });

  }
}
