import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
// import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'electron-zoom-control',
  templateUrl: './electron-zoom-control.component.html',
  styleUrls: ['./electron-zoom-control.component.scss']
})
export class ElectronZoomControlComponent implements OnInit {

  @Input()  zoomValue: any;
  itemValue
  @Output() valueEmit  = new  EventEmitter()
  constructor(
    //  private electronService: ElectronService,
    private siteService: SitesService,
    private platFormService: PlatformService,
    private settings: SettingsService) { }

  ngOnInit(): void {
    this.itemValue = 1
    if (this.zoomValue) {
      this.itemValue = this.zoomValue;
    }
    console.log('')
  }

  async setValue(event) {
    this.valueEmit.emit(event.value)
    this.itemValue = event.value;
    // await this.setZoom();
  }

  setZoom(): void {
    if (!this.platFormService.isAppElectron) {
      return;
    }

    console.log('this.itemValue', this.itemValue);

    try {
      (window as any).electron.setZoom(+this.itemValue);
    } catch (error) {
      console.error('Failed to set zoom level:', error);
      this.siteService.notify(`Failed to set zoom level: ${error}`, 'Close', 3000, 'red');
    }
  }

  async setValueByValue(value) {
    if (!this.itemValue || this.itemValue == 0) {
      this.itemValue = 1;
    }
    this.itemValue = (+this.itemValue + +value).toFixed(1);
    this.valueEmit.emit(this.itemValue)
    this.zoomValue = this.itemValue;
    this.setValue(this.itemValue)
    await this.setZoom();
  }

  async setZoomDefault() {
    this.itemValue = 1;
    this.zoomValue = 1;
    await this.setZoom();
  }

}
