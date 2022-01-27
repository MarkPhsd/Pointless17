
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PriceTierPrice,PriceTiers } from 'src/app/_interfaces/menu/price-categories';

@Injectable({
  providedIn: 'root'
})

export class FbPriceTierService {

  constructor(private fb: FormBuilder) { }
  intitFormData(inputForm: FormGroup, data: PriceTiers) {
    inputForm.patchValue(data)
    return inputForm
  }

  initForm(fb: FormGroup): FormGroup {
    fb = this.fb.group({
      id:                           [''],
      webEnabled:                   [''],
      name:                         [''],
      priceTierPrices:      this.fb.array([
      ]),
    })
    return fb
  }

  addPrice(inputForm: FormGroup, arrayType: PriceTierPrice) {
    if (!inputForm) { return }
    const control = inputForm.get('priceTierPrices') as FormArray;
    if (!control)   { return }
    control.push(this.fb.control(arrayType))
  }

}

  // id:               [''],
  // priceCategoryID:  [''],
  // retail:           [''],
  // wholeSale:        [''],
  // unitTypeID:       [''],
  // price1:           [''],
  // price2:           [''],
  // price3:           [''],
  // hideFromMenu:     [''],
  // useforInventory:  [''],
  // pizzaMultiplier:  [''],
  // unitPartRatio:    [''],
  // partMultiplyer:   [''],
  // doNotDelete:      [''],
  // pizzaSize:        [''],
  // priceType:        [''],
  // barcode:          [''],
  // itemQuantity:     [''],
  // productID:        [''],
  // tierPriceGroup:   [''],
  // price4:           [''],
  // price5:           [''],
  // price6:           [''],
  // price7:           [''],
  // price8:           [''],
  // price9:           [''],
  // price10:          [''],
  // timeBasedPrice:   [''],
  // uid:              [''],
  // weekDays:         [''],
  // endTime:          [''],
  // startTime:        [''],
  // webEnabled:       [''],
  // specialDatePrice: [''],
  // startDate:        [''],
  // endDate:          [''],
