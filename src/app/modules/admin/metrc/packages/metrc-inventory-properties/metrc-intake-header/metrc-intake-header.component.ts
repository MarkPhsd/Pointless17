import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { IUnitConversion } from 'src/app/_services/measurement/conversions.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'metrc-intake-header',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,

  SharedPipesModule],
  templateUrl: './metrc-intake-header.component.html',
  styleUrls: ['./metrc-intake-header.component.scss']
})
export class MetrcIntakeHeaderComponent {

  @Input() package         : METRCPackage;
  @Input() intakeConversion: IUnitConversion;

}
