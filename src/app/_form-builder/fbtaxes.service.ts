import { Injectable } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TaxRate } from '../_interfaces';

@Injectable({
  providedIn: 'root'
})
export class FBTaxesService {

  inputForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder) { }

  get FlatRateTaxValues(): UntypedFormArray  {
    return this.inputForm.get('flatRateTaxValues') as UntypedFormArray;
  }

  initForm(inputForm: UntypedFormGroup) {

    inputForm = this.fb.group( {
      id:                 [''],
      name:               [''],
      rate:               [''],
    })
    this.inputForm = inputForm
    return inputForm

  }

  intitFormData(inputForm: UntypedFormGroup,data: TaxRate) {
    inputForm.patchValue(data)
  }

}
