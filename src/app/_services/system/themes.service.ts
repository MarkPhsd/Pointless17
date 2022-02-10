import { Injectable } from "@angular/core";
import { Observable, throwError } from 'rxjs';
import { ITheme }  from 'src/app/_interfaces';
//import  * as  ThemesJSON from 'src/assets/ThemesJSON';

@Injectable({
  providedIn: 'root'
})

export class ThemesService {
  theme: Observable<ITheme[]>;

  constructor() {}

  getThemeOptions()
  {
    // return ThemesJSON;
  }

  setTheme(themeToSet) {
    // TODO(@SiddAjmera): Implement this later
  }


}
