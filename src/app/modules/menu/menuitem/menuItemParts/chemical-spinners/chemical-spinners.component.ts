import { Platform } from '@angular/cdk/platform';
import { Component,  Input } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';

@Component({
  selector: 'app-chemical-spinners',
  templateUrl: './chemical-spinners.component.html',
  styleUrls: ['./chemical-spinners.component.scss']
})
export class ChemicalSpinnersComponent {

  spinnerMode = 'determinate';
  spinnerText = 'spinner-text';
  platformName:string;
  @Input() menuItem    : IMenuItem;

  constructor(
    public  platform: Platform,
  ) {
    if (this.platform.ANDROID)
    {
      this.spinnerText = 'spinner-text-android'
      this.platformName = 'android'
    }
   }

}
