import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IItemType } from '../_services/menu/item-type.service';

@Injectable({
  providedIn: 'root'
})
export class FbItemTypeService {

  constructor(private fb: FormBuilder) { }

  initForm(inputForm: FormGroup) {
    inputForm = this.fb.group( {
      id:                   [''],
      name:                 ['', Validators.required],
      type:                 [''],
      useType:              ['', Validators.required],
      useGroupID:           ['', Validators.required],
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
      requiresStock       : [''],
      metrcCategoryID     : [''],
      preptTicketID       : [''],
      instructions:         [''],
      packagingMaterial   : [''],
      portionValue        : [''],
      enableCustomNote    : [''],
      wicEBT              : [''],
      requireWholeNumber  : [''],
    })
    return inputForm
  }

  intitFormData(inputForm: FormGroup,data: IItemType) {
    inputForm.patchValue(data)
  }

}
