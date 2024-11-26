import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'price-category-price-fields',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './price-category-price-fields.component.html',
  styleUrls: ['./price-category-price-fields.component.scss']
})
export class PriceCategoryPriceFieldsComponent  {

  @Input() showMore = false;
  @Input() inputForm: UntypedFormGroup;
  @Input() formGroupName: any;
  @Input() formArrayName: UntypedFormArray;
  @Input() index: number;
  @Input() item: any;

  get productPrices() : UntypedFormArray {
    return this.inputForm.get('productPrices') as UntypedFormArray;
  }

  constructor() { }



}
