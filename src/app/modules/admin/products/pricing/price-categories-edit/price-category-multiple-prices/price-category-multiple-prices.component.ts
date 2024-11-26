import { CommonModule } from '@angular/common';
import { Component, OnInit,Input } from '@angular/core';
import {  UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'price-category-multiple-prices',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './price-category-multiple-prices.component.html',
  styleUrls: ['./price-category-multiple-prices.component.scss']
})
export class PriceCategoryMultiplePricesComponent implements OnInit {

  @Input() inputForm: UntypedFormGroup ;

  constructor(
    private fb: UntypedFormBuilder
    ) {

  }

   ngOnInit(): void {
    const i = 0;
   }


}
