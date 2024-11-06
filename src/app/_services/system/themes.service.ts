// import { OverlayContainer } from "@angular/cdk/overlay";
import { Injectable, Renderer2 } from "@angular/core";
import {  Observable } from 'rxjs';
import { ITheme }  from 'src/app/_interfaces';
// import  * as  ThemesJSON from 'src/assets/ThemesJSON';

@Injectable({
  providedIn: 'root'
})

export class ThemesService {

  theme: Observable<ITheme[]>;

  // private overlayContainer:OverlayContainer
  constructor(  private _renderer : Renderer2) {}

  getThemeOptions()
  {
    // return ThemesJSON;
  }

  setTheme(themeToSet) {
    // TODO(@SiddAjmera): Implement this later
  }

  renderTheme(){
    const theme = localStorage.getItem('angularTheme')
    this._renderer.removeClass(document.body, 'dark-theme');
    this._renderer.removeClass(document.body, 'light-theme');
    this._renderer.addClass(document.body, theme);
  }

  setDarkLight(darkMode: boolean) {

    if (darkMode) {
      const theme = localStorage.getItem('angularTheme')
      this._renderer.removeClass(document.body, 'dark-theme');
      this._renderer.removeClass(document.body, 'light-theme');
      this._renderer.addClass(document.body, 'light-theme');
      // this.toggleDarkMode(true)
    }
    if (!darkMode) {
      const theme = localStorage.getItem('angularTheme')
      this._renderer.removeClass(document.body, 'dark-theme');
      this._renderer.removeClass(document.body, 'light-theme');
      this._renderer.addClass(document.body, 'dark-theme');
      // this.toggleDarkMode(false)
    }

  }

  // toggleDarkMode(isDarkMode: boolean) {
  //   if (isDarkMode) {
  //     // document.body.classList.add('dark-theme');
  //     this.overlayContainer.getContainerElement().classList.add('dark-theme');
  //   } else {
  //     // document.body.classList.remove('dark-theme');
  //     this.overlayContainer.getContainerElement().classList.remove('dark-theme');
  //   }
  // }

}
