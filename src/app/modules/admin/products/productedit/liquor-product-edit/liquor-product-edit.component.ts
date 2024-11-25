import { CommonModule } from '@angular/common';
import { Component, OnInit , Input} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'liquor-product-edit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './liquor-product-edit.component.html',
  styleUrls: ['./liquor-product-edit.component.scss']
})
export class LiquorProductEditComponent {

  @Input() inputForm: UntypedFormGroup
  constructor() { }



}
