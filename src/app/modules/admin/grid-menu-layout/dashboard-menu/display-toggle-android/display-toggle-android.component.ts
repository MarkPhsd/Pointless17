import { Component, OnInit } from '@angular/core';
import { interval, Observable, of, Subscription, switchMap } from 'rxjs';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import {  UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { dsiemvandroid } from 'dsiemvandroidplugin';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSPayment,  } from 'src/app/_interfaces';
import { CommonModule } from '@angular/common';

export interface partialVoidAction{
  device:  ITerminalSettings;
  payment: IPOSPayment;
}

@Component({
  selector: 'display-toggle-android',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-toggle-android.component.html',
  styleUrls: ['./display-toggle-android.component.scss']
})
export class DisplayToggleAndroidComponent implements OnInit {
  androidApp: boolean;
  deviceName = localStorage.getItem('devicename');
  posDevice$ : Observable<ITerminalSettings>;
  posDevice: ITerminalSettings;
  payment$ : Observable<any>;

  private checkStatusSubscription: Subscription;

  constructor(
    private uiService: UISettingsService,
    private productButtonService: ProductEditButtonService,
    public platFormService: PlatformService,
    private paymentService: POSPaymentService,
    private siteService: SitesService,
  ){
    this.androidApp = platFormService.androidApp
  }

    ngOnInit() {

      const isDisplayDevice = localStorage.getItem('displayDevice');
      this.startCheckStatus()
      if (!isDisplayDevice) { return }
        if (this.androidApp && this.deviceName) {
      }
    }

    ngOnDestroy() {
      if (this.checkStatusSubscription) {
        this.checkStatusSubscription.unsubscribe();
      }
    }

    async bringtoFront() {
      const options = {}
      if (this.androidApp && this.deviceName) {
        await dsiemvandroid.bringToFront(options)
      }
    }

    async sendToBack() {
      const options = {}
      if (this.androidApp && this.deviceName) {
        await dsiemvandroid.sendToBack(options)
      }
    }

    // checkStatus() {
    //   this.uiService.getPOSDevice(this.deviceName, true).pipe(
    //     switchMap(data => {
    //       this.posDevice = data;
    //       let action = { device: data, payment: null } as partialVoidAction;

    //       // If there's a check for partial payment status, handle it
    //       console.log('partialAuth', this.posDevice.dsiEMVSettings?.checkPartialAuth)

    //       if (this.posDevice.dsiEMVSettings?.checkPartialAuth && this.posDevice.dsiEMVSettings?.checkPartialAuth != 0) {
    //         const site = this.siteService.getAssignedSite();
    //         const paymentID = this.posDevice.dsiEMVSettings.checkPartialAuth;
    //         return this.paymentService.getPOSPayment(site, paymentID, false).pipe(
    //           switchMap(paymentData => {
    //             action.payment = paymentData;
    //             return of(action);
    //           })
    //         );
    //       }

    //       return of(action);
    //     }),
    //     switchMap(data => {
    //       if (data?.payment) {
    //         const ui  =this.uiService._transactionUISettings.value;
    //         // Opening the void prompt, need to return an observable after dialog closes
    //         const item = {ui:ui, payment: data.payment, paymentMethod: data.payment.paymentMethod}
    //         const dialogRef = this.openVoidPrompt(item);
    //         return dialogRef.afterClosed().pipe(
    //           switchMap(result => {
    //             console.log('window closed')
    //             return of(data); // Continue with the same data after prompt closes
    //           })
    //         );
    //       }
    //       return of(data); // In case no payment, just pass along the original data
    //     })
    //   ).subscribe({
    //     next: (data: partialVoidAction) => {
    //       if (data?.payment) {
    //         this.bringtoFront();
    //       } else if (this.posDevice.dsiEMVSettings?.sendToBack) {
    //         this.sendToBack();
    //       } else {
    //         this.bringtoFront();
    //       }
    //     },
    //     error: err => {
    //       console.error('Error in checkStatus:', err);
    //     }
    //   });
    // }

    checkStatus() {
      this.uiService.getPOSDevice(this.deviceName, true).pipe(
        switchMap(data => {
          this.posDevice = data;
          let action = { device: data, payment: null } as partialVoidAction;

          // If there's a check for partial payment status, handle it

          console.log('partialAuth', this.posDevice.dsiEMVSettings?.checkPartialAuth);

          if (this.posDevice.dsiEMVSettings?.checkPartialAuth && this.posDevice.dsiEMVSettings?.checkPartialAuth != 0) {
            const site = this.siteService.getAssignedSite();
            const paymentID = this.posDevice.dsiEMVSettings.checkPartialAuth;
            this.bringtoFront()
            return this.paymentService.getPOSPayment(site, paymentID, false).pipe(
              switchMap(paymentData => {
                action.payment = paymentData;
                return of(action);
              })
            );
          }

          return of(action);
        }),
        switchMap(data => {
          if (data?.payment) {
            const ui = this.uiService._transactionUISettings.value;
            const item = { ui: ui, payment: data.payment, paymentMethod: data.payment.paymentMethod };

            // Open the dialog and suspend the timer
            this.stopCheckStatus(); // Unsubscribe from the timer

            const dialogRef = this.openVoidPrompt(item);

            return dialogRef.afterClosed().pipe(
              switchMap(result => {
                console.log('window closed');
                this.startCheckStatus(); // Resubscribe to the timer when dialog closes
                return of(data); // Continue with the same data after prompt closes
              })
            );
          }
          return of(data); // In case no payment, just pass along the original data
        })
      ).subscribe({
        next: (data: partialVoidAction) => {
          if (data?.payment) {
            this.bringtoFront();
          } else if (this.posDevice.dsiEMVSettings?.sendToBack) {
            this.sendToBack();
          } else {
            this.bringtoFront();
          }
        },
        error: err => {
          console.error('Error in checkStatus:', err);
        }
      });
    }

    openVoidPrompt(item) {
      return this.productButtonService.openVoidPartialVoid(item)
    }

    startCheckStatus() {
      const isDisplayDevice = localStorage.getItem('displayDevice');
      if (!isDisplayDevice) { return; }
      this.checkStatusSubscription = interval(1000).subscribe(() => this.checkStatus());
    }

    stopCheckStatus() {
      if (this.checkStatusSubscription) {
        this.checkStatusSubscription.unsubscribe();
      }
    }
}
