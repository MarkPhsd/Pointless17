import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthenticationService } from 'src/app/_services';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],

  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenuComponent implements OnInit  {

  homePageSetings: UIHomePageSettings;
  smoke  = "./assets/video/smoke.mp4"
  isStaff : boolean;

  constructor(
    private uiSettings: UISettingsService,
    private userAuthorizationService: UserAuthorizationService,
    private authentication: AuthenticationService,
  ) {


  }

    ngOnInit(): void {

      this.isStaff = false;
      this.isStaff = this.userAuthorizationService.isCurrentUserStaff()
      //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
      //Add 'implements OnInit' to the class.
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


