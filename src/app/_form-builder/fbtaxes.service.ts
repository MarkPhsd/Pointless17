import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TaxRate } from '../_interfaces';

@Injectable({
  providedIn: 'root'
})
export class FBTaxesService {

  inputForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  get FlatRateTaxValues(): FormArray  {
    return this.inputForm.get('flatRateTaxValues') as FormArray;
  }

  initForm(inputForm: FormGroup) {

    inputForm = this.fb.group( {
      id:                 [''],
      name:               [''],
      rate:               [''],
    })
    this.inputForm = inputForm
    return inputForm

  }

  intitFormData(inputForm: FormGroup,data: TaxRate) {
    inputForm.patchValue(data)
  }

}
