import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { UnitType } from '../_interfaces/menu/price-categories';

@Injectable({
  providedIn: 'root'
})
export class FbUnitTypeService {

  constructor(private fb: FormBuilder) { }

  intitFormData(inputForm: FormGroup, data: UnitType) {
    inputForm.patchValue(data)
    return inputForm
  }

  initForm(fb: FormGroup): FormGroup {
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
    })
  }



}


