import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { PartBuilderSelectorComponent } from '../../../products/productedit/_product-edit-parts/part-builder-selector/part-builder-selector.component';

@Component({
  selector: 'app-profile-billing-address',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    FormsModule,ReactiveFormsModule,PartBuilderSelectorComponent
  ],
  templateUrl: './profile-billing-address.component.html',
  styleUrls: ['./profile-billing-address.component.scss']
})
export class ProfileBillingAddressComponent  {

  @Input() inputForm: UntypedFormGroup
  constructor() { }

}
