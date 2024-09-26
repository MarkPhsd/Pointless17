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
    if (!isDisplayDevice) { return }
      if (this.androidApp && this.deviceName) { 
        this.startCheckStatus()
      }
    }

    async bringtoFront() { 
      const options = {}
      await dsiemvandroid.bringToFront(options)
    }

    async sendToBack() { 
      const options = {}
      await dsiemvandroid.sendToBack(options)
    }


   checkStatus() { 
    this.posDevice$ = this.uiService.getPOSDevice(this.deviceName).pipe(switchMap(data =>  { 
      this.posDevice = data;
      
      if (this.posDevice.dsiEMVSettings.sendToBack) {
        this.sendToBack()    
        return of(data)
      }
      this.bringtoFront()
      return of(data) 
    }
    ));
   }

   startCheckStatus() {
    // Create an observable that emits every 1 second
    this.checkStatusSubscription = interval(1000).subscribe(() => {
      this.checkStatus();
    });
  }

}
