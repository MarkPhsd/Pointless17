import { CommonModule } from '@angular/common';
import { Component, OnInit,Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-profile-shipping-address',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,
  SharedPipesModule],
  templateUrl: './profile-shipping-address.component.html',
  styleUrls: ['./profile-shipping-address.component.scss']
})
export class ProfileShippingAddressComponent   {

  @Input() inputForm: UntypedFormGroup
  constructor() { }

  sameAsBiling() {

    const address =this.inputForm.controls['billingAddress'].value
    const address2 =this.inputForm.controls['billingAddress2'].value
    const city =this.inputForm.controls['billingCity'].value
    const state  =this.inputForm.controls['billingState'].value
    const zip =this.inputForm.controls['billingZIp'].value

    const item = {
      shippingAddress: address,
      shippingAddress2: address2,
      city: city,
      state: state,
      zip: zip
    }
    this.inputForm.patchValue(item)
  }
}
