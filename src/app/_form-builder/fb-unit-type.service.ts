import { Injectable } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UnitType } from '../_interfaces/menu/price-categories';

@Injectable({
  providedIn: 'root'
})
export class FbUnitTypeService {

  constructor(private fb: UntypedFormBuilder) { }

  intitFormData(inputForm: UntypedFormGroup, data: UnitType) {
    inputForm.patchValue(data)
    return inputForm
  }

  initForm(fb: UntypedFormGroup): UntypedFormGroup {
    return this.fb.group({
      id:               [''],
      name:             [''],
      unitNote:         [''],
      unitCategory:     [''],
      unitMultipliedTo: [''],
      unitMultiplyer:   [''],
      mainUnit:         [''],
      isMainUnit:       [''],
      itemMultiplier:   [''],
      doNotDelete:      [''],
      abbreviation:     [''],
      plural:           [''],
      milileters:       [''],
      fluidOunces:      [''],
      massOunces:       [''],
      grams:            [''],
      unitID:           [''],
      uid:              [''],
      limitMultiplier : [''],
    })
  }



}


