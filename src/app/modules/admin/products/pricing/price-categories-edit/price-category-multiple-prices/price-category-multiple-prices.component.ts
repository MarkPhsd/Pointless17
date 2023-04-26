import { Component, OnInit,Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ProductPrice } from 'src/app/_interfaces';

@Component({
  selector: 'price-category-multiple-prices',
  templateUrl: './price-category-multiple-prices.component.html',
  styleUrls: ['./price-category-multiple-prices.component.scss']
})
export class PriceCategoryMultiplePricesComponent implements OnInit {

  @Input() inputForm: FormGroup ;

  constructor(
    private fb: FormBuilder
    ) {
 
  }

   ngOnInit(): void {
    const i = 0;
   }


}
