import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector'
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'app-device-info',
  templateUrl: './device-info.component.html',
  styleUrls: ['./device-info.component.scss']
})
export class DeviceInfoComponent implements OnInit {

  deviceInfo      : any;
  isMobile        : boolean;
  isTablet        : boolean;
  isDesktopDevice : boolean;
  deviceName      : string;
  posToken        : string;

  debugOnThisDevice: boolean;
  constructor(
    public platformService: PlatformService,
    public  deviceService:   DeviceDetectorService,) { }

  ngOnInit(): void {
    this.getDeviceInfo();
    this.deviceName = localStorage.getItem('devicename');
    this.debugOnThisDevice = this.getdebugOnThisDevice()
  }

  setAPIToken() {
    localStorage.setItem('posToken', this.posToken)
  }

  getdebugOnThisDevice() {
    if (localStorage.getItem('debugOnThisDevice') === 'true') {
      return true;
    }
    return false;
  }

  testErrorSentry() {
    const someValue = localStorage.getItem('getSomeValue')
    // const myValue   = someValue * 100
    throw('Error')
  }

  setDebugOnThisDevice() {
    if (localStorage.getItem('debugOnThisDevice') === 'true') {
      localStorage.setItem('debugOnThisDevice', 'false')// === 'false'
      this.debugOnThisDevice =  false;
      console.log(localStorage.getItem('debugOnThisDevice'))
      return
    }
    localStorage.setItem('debugOnThisDevice', 'true') // === 'true'
    this.debugOnThisDevice =  true;
    console.log(localStorage.getItem('debugOnThisDevice'))
  }

  getDeviceInfo() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktopDevice = this.deviceService.isDesktop();
  }

  saveDeviceName() {
    localStorage.setItem('devicename', this.deviceName)
  }

}
