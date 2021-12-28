
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { IPriceCategories, ProductPrice } from '../_interfaces/menu/price-categories';


@Injectable({
  providedIn: 'root'
})

export class FbPriceCategoriesService {

  constructor(private fb: FormBuilder) { }


  intitFormData(inputForm: FormGroup, data: IPriceCategories) {
    inputForm.patchValue(data)
    return inputForm
  }


  initForm(fb: FormGroup): FormGroup {
    fb = this.fb.group({
      id:                           [''],
      name:                         [''],
      productPrices:      this.fb.array([

      ]),
    })
    return fb
  }

  addPrice(inputForm: FormGroup, arrayType: ProductPrice) {
    if (!inputForm) { return }
    const control = inputForm.get('productPrices') as FormArray;
    if (!control)   { return }
    control.push(this.fb.control(arrayType))
  }

  addPriceArray() {
    return this.fb.group({
      id:               [''],
      priceCategoryID:  [''],
      retail:           [''],
      wholeSale:        [''],
      unitTypeID:       [''],

      hideFromMenu:     [''],
      useforInventory:  [''],
      pizzaMultiplier:  [''],
      unitPartRatio:    [''],
      partMultiplyer:   [''],
      doNotDelete:      [''],
      pizzaSize:        [''],
      priceType:        [''],
      barcode:          [''],
      itemQuantity:     [''],
      productID:        [''],
      tierPriceGroup:   [''],
      price1:           [''],
      price2:           [''],
      price3:           [''],
      price4:           [''],
      price5:           [''],
      price6:           [''],
      price7:           [''],
      price8:           [''],
      price9:           [''],
      price10:          [''],
      timeBasedPrice:   [''],
      uid:              [''],
      weekDays:         [''],
      endTime:          [''],
      startTime:        [''],
      webEnabled:       [''],
      specialDatePrice: [''],
      startDate:        [''],
      endDate:          [''],
      gramPrice:        0,
      eightPrice:       0,
      halfPrice:        0,
      quarterPrice:     0,
      ouncePrice:       0,
    }
  )
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
