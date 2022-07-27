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
      localStorage.getItem('debugOnThisDevice') === 'false'
      return false;
    }
    localStorage.getItem('debugOnThisDevice') === 'true'
    return true;
  }

  setDebugOnThisDevice() {
    if (localStorage.getItem('debugOnThisDevice') === 'true') {
      localStorage.setItem('debugOnThisDevice', 'false')// === 'false'
      this.debugOnThisDevice =  false;
      return
    }
    localStorage.setItem('debugOnThisDevice', 'false') // === 'true'
    this.debugOnThisDevice =  true;
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
