import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
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
  standalone: true,
  imports: [CommonModule,FormsModule,MatLegacyButtonModule,MatIconModule],
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

    if (this.userAuthorizationService.user && this.userAuthorizationService?.user?.userPreferences ){
      const darkMode =  this.userAuthorizationService?.user?.userPreferences?.darkMode;
      if ( darkMode ) {
        localStorage.setItem('angularTheme', 'light-theme')
        if (this.userAuthorizationService?.user?.userPreferences) {
          let pref =  JSON.parse(JSON.stringify(this.userAuthorizationService?.user?.userPreferences))
          if (pref) {
            pref.darkMode = false
            this.action$ =  this.savePreferences(pref, this.userAuthorizationService.user.id)
          }
        }
        this.renderTheme();
        return;
      }
      if (!darkMode) {
        localStorage.setItem('angularTheme', 'dark-theme')
        if (this.userAuthorizationService?.user?.userPreferences) {
          let pref =  JSON.parse(JSON.stringify(this.userAuthorizationService?.user?.userPreferences))
          if (pref){
            pref.darkMode = true
            this.action$ =  this.savePreferences(pref, this.userAuthorizationService.user.id)
          }
        }
        this.renderTheme();
        return;
      }
      return
    }
    let theme = ''

    if (this.toggleTheme === 'dark-theme' ) {
      theme = 'light-theme'
      localStorage.setItem('angularTheme', theme)
    } else {
      theme = 'dark-theme'
      localStorage.setItem('angularTheme', theme)
    }

    this.toggleTheme  = theme;
    console.log('theme', theme)
    this.renderTheme();


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
