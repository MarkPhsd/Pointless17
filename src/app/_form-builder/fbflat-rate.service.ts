import { Injectable } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TaxRate } from '../_interfaces';
import { FlatRateTax } from '../_services/menu/item-type.service';

@Injectable({
  providedIn: 'root'
})
export class FBFlatRateService {

  inputForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder) { }

  get FlatRateTaxValues(): UntypedFormArray  {
    return this.inputForm.get('flatRateTaxValues') as UntypedFormArray;
  }

  initForm(inputForm: UntypedFormGroup): UntypedFormGroup {

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

  intitFormData(inputForm: UntypedFormGroup,data: FlatRateTax) {
    inputForm.patchValue(data)
  }

}
