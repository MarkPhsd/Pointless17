import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'price-category-time-filters',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './price-category-time-filters.component.html',
  styleUrls: ['./price-category-time-filters.component.scss']
})
export class PriceCategoryTimeFiltersComponent {

  @Input() showTime : boolean;;
  @Input() inputForm: UntypedFormGroup;
  @Input() formGroupName: any;

  constructor() { }



}
