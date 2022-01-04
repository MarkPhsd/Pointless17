import { Component, Input, OnInit } from '@angular/core';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { IUnitConversion } from 'src/app/_services/measurement/conversions.service';

@Component({
  selector: 'metrc-intake-header',
  templateUrl: './metrc-intake-header.component.html',
  styleUrls: ['./metrc-intake-header.component.scss']
})
export class MetrcIntakeHeaderComponent {

  @Input() package         : METRCPackage;
  @Input() intakeConversion: IUnitConversion;

}
