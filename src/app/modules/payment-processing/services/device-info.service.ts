import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector'

@Injectable({
  providedIn: 'root'
})
export class DeviceInfoService {

  deviceInfo      : any;
  isMobile        : boolean;
  isTablet        : boolean;
  isDesktopDevice : boolean;
  deviceName      : string;

  constructor(private  deviceService:   DeviceDetectorService,) {
    this.getDeviceInfo()
  }

  getDeviceInfo() {
    this.deviceName = localStorage.getItem('devicename');
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktopDevice = this.deviceService.isDesktop();
  }

  setDeviceName(deviceName: string) {
    localStorage.setItem('devicename', deviceName)
    this.deviceName = deviceName;
  }

}
