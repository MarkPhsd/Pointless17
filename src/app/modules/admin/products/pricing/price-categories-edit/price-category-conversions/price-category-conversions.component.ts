import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'price-category-conversions',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './price-category-conversions.component.html',
  styleUrls: ['./price-category-conversions.component.scss']
})
export class PriceCategoryConversionsComponent  {
  @Input() showMore = false;
  @Input() inputForm: UntypedFormGroup;
  @Input() formGroupName: any;
  constructor() { }


}
