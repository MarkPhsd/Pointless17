import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TaxRate } from '../_interfaces';
import { FlatRateTax } from '../_services/menu/item-type.service';

@Injectable({
  providedIn: 'root'
})
export class FBFlatRateService {

  inputForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  get FlatRateTaxValues(): FormArray  {
    return this.inputForm.get('flatRateTaxValues') as FormArray;
  }

  initForm(inputForm: FormGroup): FormGroup {

    inputForm = this.fb.group( {
      id:                 [''],
      name:               [''],
      flatRateTaxValues: this.fb.array(  this.createTaxRateControl()  )
    })
    // this.inputForm = inputForm
    return inputForm

  }

  addFlatTaxRate() {

      this.FlatRateTaxValues.push( this.createTaxRateControl() )

  }

  createTaxRateControl(): any {

    return this.fb.array(
          [this.fb.group({
            id:                 [''],
            rateStart:          [''],
            rateEnd:            [''],
            fee:                [''],
            flatRateTaxID:      [''],
              }
            )
          ]
        )
  }

  intitFormData(inputForm: FormGroup,data: FlatRateTax) {
    inputForm.patchValue(data)
  }

}
