import { Injectable, Renderer2 } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { ITheme }  from 'src/app/_interfaces';
// import  * as  ThemesJSON from 'src/assets/ThemesJSON';

@Injectable({
  providedIn: 'root'
})

export class ThemesService {

  theme: Observable<ITheme[]>;

  private _swapMenuWithOrder   = new BehaviorSubject<boolean>(null);
  public  swapMenuWithOrder$   = this._swapMenuWithOrder.asObservable();

  constructor(
    private _renderer : Renderer2) {}

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
    }
    if (!darkMode) {
      const theme = localStorage.getItem('angularTheme')
      this._renderer.removeClass(document.body, 'dark-theme');
      this._renderer.removeClass(document.body, 'light-theme');
      this._renderer.addClass(document.body, 'dark-theme');
    }

  }

  swapMenuWithOrder(swap: boolean) {
    this._swapMenuWithOrder.next(swap)
  }

}
