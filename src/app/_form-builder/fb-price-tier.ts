
import { Injectable } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PriceTierPrice,PriceTiers } from 'src/app/_interfaces/menu/price-categories';

@Injectable({
  providedIn: 'root'
})

export class FbPriceTierService {

  constructor(private fb: UntypedFormBuilder) { }
  intitFormData(inputForm: UntypedFormGroup, data: PriceTiers) {
    inputForm.patchValue(data)
    return inputForm
  }

  initForm(fb: UntypedFormGroup): UntypedFormGroup {
    fb = this.fb.group({
      id:                           [''],
      webEnabled:                   [''],
      name:                         [''],
      priceTierPrices:      this.fb.array([
      ]),
    })
    return fb
  }

  addPrice(inputForm: UntypedFormGroup, arrayType: PriceTierPrice) {
    if (!inputForm) { return }
    const control = inputForm.get('priceTierPrices') as UntypedFormArray;
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
