import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { ElectronService } from 'ngx-electron';

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
     private electronService: ElectronService,
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

  async setZoom() {
    const electron = this.electronService.remote.require('./index.js');
    if (!electron) {
      console.log('electron is undefined')
      return;
    }
    console.log('this.itemvalue', this.itemValue)
    await electron.electronZoomControl(this.itemValue)
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
