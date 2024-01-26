import { Component, OnInit, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs';
import { UserPreferences } from 'src/app/_interfaces';
import { AuthenticationService, ContactsService, ThemesService } from 'src/app/_services';
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
    public  userSwitchingService : UserSwitchingService,
    private toolbarUIService    : ToolBarUIService,
    private clientTableService: ClientTableService,
    private siteService: SitesService,
    private authenticationService: AuthenticationService,
    private _renderer: Renderer2) {
    this.renderTheme();
  }

  switchTheme() {


    // console.log(this.userAuthorizationService.user)
    // console.log(this.userAuthorizationService.user.userPreferences, this.userAuthorizationService.user.userPreferences.darkMode)

    if (this.userAuthorizationService.user ){
      const darkMode =  this.userAuthorizationService?.user?.userPreferences?.darkMode;
      if ( darkMode ) {
        let pref =  JSON.parse(JSON.stringify(this.userAuthorizationService.user.userPreferences))
        pref.darkMode = false
        console.log('setfalse', this.userAuthorizationService.user.userPreferences.darkMode )
        localStorage.setItem('angularTheme', 'light-theme')
        this.action$ =  this.savePreferences(pref, this.userAuthorizationService.user.id)
        this.renderTheme();
        return;
      }
      if (!darkMode) {
        let pref =  JSON.parse(JSON.stringify(this.userAuthorizationService.user.userPreferences))
        pref.darkMode = true
        console.log('settrue', this.userAuthorizationService.user.userPreferences.darkMode )
        localStorage.setItem('angularTheme', 'dark-theme')
        this.action$ =  this.savePreferences(pref, this.userAuthorizationService.user.id)
        this.renderTheme();
        return;
      }
    }

    if (!this.userAuthorizationService.user) {
      if (this.toggleTheme === 'dark-theme' ) {
        localStorage.setItem('angularTheme', 'light-theme')
      } else {
        localStorage.setItem('angularTheme', 'dark-theme')
      }
      this.renderTheme();
    }

  }

  renderTheme() {

    if (this.userAuthorizationService.user ){
      if (this.userAuthorizationService?.user?.userPreferences?.darkMode) {
          this._renderer.addClass(document.body, 'dark-theme');
          this._renderer.removeClass(document.body, 'light-theme');
      } else {
          this._renderer.addClass(document.body, 'light-theme');
          this._renderer.removeClass(document.body, 'dark-theme');
      }
      return;
    }

    if (!this.userAuthorizationService.user) {
      this.toggleTheme = localStorage.getItem('angularTheme')
      if (this.toggleTheme === 'dark-theme' ) {
        this._renderer.addClass(document.body, 'dark-theme');
        this._renderer.removeClass(document.body, 'light-theme');
      } else {
        this._renderer.addClass(document.body, 'light-theme');
        this._renderer.removeClass(document.body, 'dark-theme');
      }
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
    let user = JSON.parse(JSON.stringify(this.userAuthorizationService.user));
    user.userPreferences = userPreferences
    localStorage.setItem('user', JSON.stringify(user))
    this.authenticationService._user.next(user)
    return this.clientTableService.savePreferences(site, item, +id);
  }

}
