import { Component, OnInit } from '@angular/core';
import { BooleanValueAccessor } from '@ionic/angular';
import { interval, Observable, of, Subscription, switchMap } from 'rxjs';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { dsiemvandroid } from 'dsiemvandroidplugin';
@Component({
  selector: 'display-toggle-android',
  templateUrl: './display-toggle-android.component.html',
  styleUrls: ['./display-toggle-android.component.scss']
})
export class DisplayToggleAndroidComponent implements OnInit {
  androidApp: boolean;
  deviceName = localStorage.getItem('devicename');
  posDevice$ : Observable<ITerminalSettings>;
  posDevice: ITerminalSettings;
  private checkStatusSubscription: Subscription;

  constructor(
    private uiService: UISettingsService,
    platFormService: PlatformService,
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

    checkStatus() {
      this.uiService.getPOSDevice(this.deviceName, true).subscribe({
        next: (data) => {
          this.posDevice = data;
          // console.log('front or back', data.dsiEMVSettings.sendToBack, data.dsiEMVSettings);

          if (this.posDevice.dsiEMVSettings.sendToBack) {
            console.log('status in back');
            this.sendToBack();
          } else {
            console.log('bringing to front');
            this.bringtoFront();
          }
        },
        error: (err) => {
          console.error('Error checking POS device status:', err);
          // You can choose to handle retries, logging, or notifications here
        },
      });
    }

    startCheckStatus() {
      const isDisplayDevice = localStorage.getItem('displayDevice');
      if (!isDisplayDevice) { return }
      this.checkStatusSubscription = interval(1000).subscribe(() => this.checkStatus());
    }


}
