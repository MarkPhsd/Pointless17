import { Component, OnInit, Renderer2 } from '@angular/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';

@Component({
  selector: 'app-toggle-theme',
  templateUrl: './toggle-theme.component.html',
  styleUrls: ['./toggle-theme.component.scss']
})
export class ToggleThemeComponent{
  toggleTheme              : string;

  constructor(
    public userAuthorizationService: UserAuthorizationService,
    private userSwitchingService : UserSwitchingService,
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
      this.userAuthorizationService.user.userPreferences.swapMenuOrderPlacement  = !this.userAuthorizationService?.user?.userPreferences?.swapMenuOrderPlacement;
      this.userSwitchingService.setUserInfo(this.userAuthorizationService.user, this.userAuthorizationService.user.password)
    }
  }
}
