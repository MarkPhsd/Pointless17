
import { Injectable } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PriceCategories, ProductPrice } from '../_interfaces/menu/price-categories';

@Injectable({
  providedIn: 'root'
})

export class FbPriceCategoriesService {

  constructor(private fb: UntypedFormBuilder) { }

  intitFormData(inputForm: UntypedFormGroup, data: PriceCategories) {
    inputForm.patchValue(data)
    return inputForm
  }


  initForm(fb: UntypedFormGroup): UntypedFormGroup {
    fb = this.fb.group({
      id:                           [''],
      name:                         [''],
      productPrices:      this.fb.array([
      ]),
    })
    return fb
  }

  addPrice(inputForm: UntypedFormGroup, arrayType: ProductPrice) {
    if (!inputForm) { return }
    const control = inputForm.get('productPrices') as UntypedFormArray;
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
      gramPrice:        [''],
      eightPrice:       [''],
      halfPrice:        [''],
      quarterPrice:     [''],
      ouncePrice:       [''],
    }
  )
  }

}
