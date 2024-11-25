import { Platform } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { Component,  Input } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ValueSpinnerComponent } from 'src/app/shared/widgets/value-spinner/value-spinner.component';

@Component({
  selector: 'app-chemical-spinners',

  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    ValueSpinnerComponent,
  ],

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
