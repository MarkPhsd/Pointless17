import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-profile-billing-address',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './profile-billing-address.component.html',
  styleUrls: ['./profile-billing-address.component.scss']
})
export class ProfileBillingAddressComponent  {

  @Input() inputForm: UntypedFormGroup
  constructor() { }

}
