import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ItemTypeComponent } from '../modules/admin/products/item-type/item-type.component';
import { IItemType } from '../_services/menu/item-type.service';

@Injectable({
  providedIn: 'root'
})
export class FbItemTypeService {

  constructor(private fb: FormBuilder) { }

  initForm(inputForm: FormGroup) {
    inputForm = this.fb.group( {
      id:                   [''],
      name:                 [''],
      type:                 [''],
      weightedItem:         [''],
      expirationRequired:   [''],
      labelRequired:        [''],
      ageRequirement:       [''],
      sortOrder:            [''],
      enabled:              [''],
      useType:              [''],
      useGroupID:           [''],
      icon:                 [''],
      imageName:            [''],
      taxable:              [''],
      prepTicketID:         [''],
      labelTypeID:          [''],
      printLocationID:      [''],
      printerName:          [''],
    })
    return inputForm

  }

  intitFormData(inputForm: FormGroup,data: IItemType) {
    inputForm.patchValue(data)
  }


}
