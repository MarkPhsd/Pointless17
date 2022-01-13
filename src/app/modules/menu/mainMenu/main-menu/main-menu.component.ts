import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],

  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenuComponent   {

  homePageSetings: UIHomePageSettings;
  smoke  = "./assets/video/smoke.mp4"
  constructor(
    private uiSettings: UISettingsService,
  ) {

    this.uiSettings.getSetting('UIHomePageSettings').subscribe( data => {
      if (data) {
        this.homePageSetings  = JSON.parse(data.text) as UIHomePageSettings;
      }
      if (!data) {
        this.homePageSetings = {} as UIHomePageSettings
        this.homePageSetings.categoriesEnabled = true;
        this.homePageSetings.brandsEnabled     = true;
        this.homePageSetings.tierMenuEnabled   = true;
      }
    })

  }



}
