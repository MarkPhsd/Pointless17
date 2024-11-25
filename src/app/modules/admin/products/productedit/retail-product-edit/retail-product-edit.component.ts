import { Component, OnInit , Input} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ValueFieldsComponent } from '../_product-edit-parts/value-fields/value-fields.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'retail-product-edit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    ValueFieldsComponent,
  ],
  templateUrl: './retail-product-edit.component.html',
  styleUrls: ['./retail-product-edit.component.scss']
})
export class RetailProductEditComponent  {

  @Input() inputForm: UntypedFormGroup
  constructor() { }


}
