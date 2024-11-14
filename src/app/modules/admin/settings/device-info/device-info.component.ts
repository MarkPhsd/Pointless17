import { Component, Input, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector'
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UIHomePageSettings } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-device-info',
  templateUrl: './device-info.component.html',
  styleUrls: ['./device-info.component.scss']
})
export class DeviceInfoComponent implements OnInit {

  @Input() uiHomePage!: UIHomePageSettings
  deviceInfo      : any;
  isMobile        : boolean;
  isTablet        : boolean;
  isDesktopDevice : boolean;
  deviceName      : string;
  debugOnThisDevice: boolean;
  ipAddress$: Observable<any>;

  constructor(
    public platformService: PlatformService,
    public authService: AuthenticationService,
    private siteService: SitesService,
    public  deviceService:   DeviceDetectorService,) { }

  ngOnInit(): void {
    this.getDeviceInfo();
    this.deviceName = localStorage.getItem('devicename');
    this.debugOnThisDevice = this.getdebugOnThisDevice();
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

      return
    }
    localStorage.setItem('debugOnThisDevice', 'true') // === 'true'
    this.debugOnThisDevice =  true;

  }

  getDeviceInfo() {
    // this.deviceInfo = this.deviceService.getDeviceInfo();
    this.ipAddress$ = this.siteService.getIpAddress(this.uiHomePage?.ipInfoToken)
    this.deviceInfo =  this.authService.getTracker(this.authService.userValue?.username, true)
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktopDevice = this.deviceService.isDesktop();
  }

  saveDeviceName() {
    localStorage.setItem('devicename', this.deviceName)
  }

}
