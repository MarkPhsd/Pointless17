import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IItemType } from '../_services/menu/item-type.service';

@Injectable({
  providedIn: 'root'
})
export class FbItemTypeService {

  constructor(private fb: UntypedFormBuilder) { }

  initForm(inputForm: UntypedFormGroup) {
    inputForm = this.fb.group( {
      id:                   [''],
      name:                 ['', Validators.required],
      type:                 [''],
      useType:              ['', Validators.required],
      useGroupID:           ['', Validators.required],
      unitName:             [''],
      weightedItem:         [''],
      expirationRequired:   [''],
      labelRequired:        [''],
      ageRequirement:       [''],
      sortOrder:            [''],
      enabled:              [''],
      icon:                 [''],
      imageName:            [''],
      taxable:              [''],
      prepTicketID        : [''],
      labelTypeID         : [''],
      printerName         : [''],
      printLocationID     : [''],
      // itemType_Categories : ItemTypeCategory[];
      requiresSerial      : [''],
      packageType         : [''],
      requireInStock      : [''],
     
      metrcCategoryID     : [''],
      preptTicketID       : [''],
      instructions:         [''],
      packagingMaterial   : [''],
      portionValue        : [''],
      enableCustomNote    : [''],
      wicebt              : [''],
      requireWholeNumber  : [''],
      pricePrompt:          [''],
      disablePriceCategory: [''],
      disableSimplePrice: [''],
      promptQuantity: [''],
      useDefaultPriceInApp: [],
      description: [''],
      webStoreSimpleView: [],
      requireProductCount: [],
      itemRowColor: [],
      sidePrepList: [],
    })
    return inputForm
  }

  intitFormData(inputForm: UntypedFormGroup,data: IItemType) {
    inputForm.patchValue(data)
  }

}
