import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { IProduct } from 'src/app/_interfaces';
import { ItemType } from 'src/app/_interfaces/menu/menu-products';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-printer-location-selection',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,
  SharedPipesModule],
  templateUrl: './printer-location-selection.component.html',
  styleUrls: ['./printer-location-selection.component.scss']
})
export class PrinterLocationSelectionComponent  {

  @Input() product: IProduct
  @Input() itemType: ItemType;
  @Input() inputForm: UntypedFormGroup;

  printerID: number;
  printerLocations$ : Observable<any>;

  constructor() {

    // if (this.itemType) {}

    if (this.product && this.itemType) {


    }


  }



}
