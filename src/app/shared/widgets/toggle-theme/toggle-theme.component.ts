import { Component, OnInit, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs';
import { UserPreferences } from 'src/app/_interfaces';
import { ContactsService, ThemesService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';

@Component({
  selector: 'app-toggle-theme',
  templateUrl: './toggle-theme.component.html',
  styleUrls: ['./toggle-theme.component.scss']
})
export class ToggleThemeComponent{
  toggleTheme              : string;

  swapBars = false;
  action$ : Observable<any>;

  constructor(
    public  userAuthorizationService: UserAuthorizationService,
    private userSwitchingService : UserSwitchingService,
    private toolbarUIService    : ToolBarUIService,
    private clientTableService: ClientTableService,
    private siteService: SitesService,
    private _renderer: Renderer2) {
    this.renderTheme();
  }

  switchTheme() {
    if (this.toggleTheme === 'dark-theme' ) {
      localStorage.setItem('angularTheme', 'light-theme')
    } else {
      localStorage.setItem('angularTheme', 'dark-theme')
    }
    this.renderTheme();
  }

  renderTheme() {
    this.toggleTheme = localStorage.getItem('angularTheme')
    if (this.toggleTheme === 'dark-theme' ) {
      this._renderer.addClass(document.body, 'dark-theme');
      this._renderer.removeClass(document.body, 'light-theme');
    } else {
      this._renderer.addClass(document.body, 'light-theme');
      this._renderer.removeClass(document.body, 'dark-theme');
    }
  }

  get orderBarPref() {
    return this.userAuthorizationService?.user?.userPreferences?.swapMenuOrderPlacement;
  }

  toggleBars() {

    if (this.userAuthorizationService.user && this.userAuthorizationService.user.userPreferences) {

      const item = !this.userAuthorizationService?.user?.userPreferences?.swapMenuOrderPlacement;
      let pref = this.userAuthorizationService.user.userPreferences;
      pref.swapMenuOrderPlacement = item;

      this.action$ = this.savePreferences(pref, this.userAuthorizationService.user.id)

      let user = this.userAuthorizationService.user;
      user.preferences = JSON.stringify(pref)
      user.userPreferences = pref;
      this.userSwitchingService.setUserInfo(user, this.userAuthorizationService.user.password);
      this.userSwitchingService.swapMenuWithOrder(user.userPreferences.swapMenuOrderPlacement);

      this.toolbarUIService.swapMenuWithOrderBoolean = item

      return;
    }

    this.swapBars = !this.swapBars;
    this.userSwitchingService.swapMenuWithOrder(this.swapBars);
    this.toolbarUIService.swapMenuWithOrderBoolean = this.swapBars;

  }

  savePreferences(userPreferences: UserPreferences, id: Number) {
    // this.client
    const item = JSON.stringify(userPreferences)
    const site = this.siteService.getAssignedSite()
    return this.clientTableService.savePreferences(site, item, +id);
  }

}
