import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector'

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

  debugOnThisDevice: boolean;
  constructor( public  deviceService:   DeviceDetectorService,) { }

  ngOnInit(): void {
    this.getDeviceInfo();
    this.deviceName = localStorage.getItem('devicename');
    this.debugOnThisDevice = this.getdebugOnThisDevice()
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
