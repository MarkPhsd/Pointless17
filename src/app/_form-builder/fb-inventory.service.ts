import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IInventoryAssignment } from '../_services/inventory/inventory-assignment.service';


@Injectable({
  providedIn: 'root'
})
export class FbInventoryService {
  constructor(private _fb: FormBuilder) { }

  initForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id:                    [''],
      packageType:           [''],
      productName:           [''],
      productCategoryName:   [''],
      itemStrainName:        [''],
      sku:                   [''],
      label:                 [''],
      metrcPackageID:        [''],
      locationID:            [''],
      location:              [''],
      unitOfMeasureName:     [''],
      unitMulitplier:        [''],
      baseQuantity:          [''],
      baseQuantityRemaining: [''],
      packageQuantity:       [''],
      packageCountRemaining: [''],
      unitConvertedtoName:   [''],
      jointWeight:           [''],
      intakeUOM:             [''],
      intakeConversionValue: [''],
      packagedOrBulk:        [''],
      productID:             [''],
      dateCreated:           [''],
      expiration:            [''],
   // facilityLicenseNumber  [''],
      facilityLicenseNumber: [''],
      batchDate:             [''],
      cost:                  [''],
      price:                 [''],
      priceScheduleID:       [''],
      notAvalibleForSale:    [''],
      thc:                   [''],
      thc2:                  [''],
      thca2:                 [''],
      thca:                  [''],
      cbd:                   [''],
      cbd2:                  [''],
      cbda2:                 [''],
      cbda:                  [''],
      cbn:                   [''],
      cbn2:                  [''],
      employeeID:            [''],
      employeeName:          [''],
      requiresAttention:     [''],
      beginDate:             [''],
      endDate:               [''],
      adjustmentNote:        [''],
      adjustmentDate:        [''],
      adjustmentType:        [''],
    })

    return fb;
  }

  setItemValues(item: IInventoryAssignment, inputForm: FormGroup): IInventoryAssignment {
    if (inputForm.valid) {
      //first we set the value of the product from the form.
      //then we can set values that aren't filled. we can do this in the api or on the app?
      const  item                 = inputForm.value;
      return item
    }
  }

  intitFormData(inputForm: FormGroup, data: IInventoryAssignment) {
    inputForm.patchValue(data)
    return inputForm
  }
}
