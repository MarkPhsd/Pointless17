import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { GridsterSettings } from '../grid-models';

@Component({
  selector: 'grid-designer-info',
  templateUrl: './grid-designer-info.component.html',
  styleUrls: ['./grid-designer-info.component.scss']
})
export class GridDesignerInfoComponent implements OnInit {

  @Input()  swap : boolean;
  gridSetting    : GridsterSettings;
  grid           : ISetting;
  setting$       : Observable<ISetting>;
  constructor(
    public authService         : AuthenticationService,
    public layoutService       : GridsterLayoutService,
    public settingService      : SettingsService,
    private sitesService       : SitesService,
   ) { }

  ngOnInit(): void {
    const i = 0
    this.setting$ = this.layoutService.getGridsterDesignSettings()
    this.setting$.subscribe(data => {
      if (data) {
        let gridSetting = JSON.parse(data.text) as GridsterSettings;
        if (!gridSetting) {gridSetting = {} as GridsterSettings;}
        this.refreshSettings(gridSetting)
        this.grid = data
      }
    })
  }

  getLayoutSettingsgDisplay(gridSetting: GridsterSettings) { 
    gridSetting.swap              = this.layoutService.options.swap;
    gridSetting.swapWhileDragging = this.layoutService.options.swapWhileDragging;
    gridSetting.pushItems         = this.layoutService.options.pushItems;
    return gridSetting;
  }

  saveSettings() {

    const site = this.sitesService.getAssignedSite();
    if (!this.gridSetting) {this.gridSetting = {} as GridsterSettings}
    if (this.gridSetting) {

      this.gridSetting = this.getLayoutSettingsgDisplay(this.gridSetting);
      const json = JSON.stringify(this.gridSetting);

      if (!this.grid) { this.grid = {} as ISetting}
      
      this.grid.text = json;
      console.log(this.grid.id)

      let setting$ = new Observable<ISetting>();
      if (this.grid) {
        if (this.grid.id  == undefined && this.grid.id == 0) {
          console.log('post')
          setting$ =  this.settingService.postSetting(site, this.grid)
          this.saveSetting(setting$ );
          return;
        }
      }

      if (this.grid.id != 0) {
        console.log('put')
        setting$ =  this.settingService.putSetting(site, this.grid.id, this.grid);
        this.saveSetting(setting$ );
        return;
      }

    }
  }

  saveSetting(setting$) {
    setting$.subscribe(data => {
      const gridSetting = JSON.parse(data.text) as GridsterSettings;
      console.log(data.text)
      this.layoutService.options.swap              = gridSetting.swap
      this.layoutService.options.swapWhileDragging = gridSetting.swapWhileDragging
      this.layoutService.options.pushItems         = gridSetting.pushItems         
      this.layoutService.changedOptions();
    })
  }

  changedOptions() {
    this.saveSettings();
  }

  refreshSettings(gridSetting: GridsterSettings) {
    if (gridSetting) { gridSetting = {} as GridsterSettings}
    if (!gridSetting.swap)              { gridSetting.swap  = false }
    if (!gridSetting.pushItems)         { gridSetting.pushItems  = false }
    if (!gridSetting.swapWhileDragging) { gridSetting.swapWhileDragging  = false }
    this.gridSetting                      = gridSetting;
    this.layoutService.options.swap       = gridSetting.swap;
    this.layoutService.options.swapWhileDragging = gridSetting.swapWhileDragging;
    this.layoutService.options.pushItems  = gridSetting.pushItems;
  }

}
