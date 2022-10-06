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
      id:                    [],
      manifestID            :[],
      packageType:           [],
      productName:           [],
      productCategoryName:   [],
      itemStrainName:        [],
      unitOfMeasureName:     [],
      unitMulitplier:        [],
      sku:                   [],
      label:                 [],
      metrcPackageID:        [],
      locationID:            [],
      location:              [],
      baseQuantity:          [],
      packageQuantity:       [],
      unitConvertedtoName:   [],
      productID:             [],
      packageCountRemaining: [],
      baseQuantityRemaining: [],
      dateCreated:           [],
      expiration:            [],
      facilityLicenseNumber: [],
      batchDate:             [],
      cost:                  [],
      price:                 [],
      notAvalibleForSale:    [],
      thc:                   [],
      thc2:                  [],
      thca2:                 [],
      thca:                  [],
      cbd:                   [],
      cbd2:                  [],
      cbda2:                 [],
      cbda:                  [],
      cbn:                   [],
      cbn2:                  [],
      employeeID:            [],
      employeeName:          [],
      requiresAttention:     [],
      jointWeight:           [],
      beginDate:             [],
      endDate:               [],
      intakeUOM:             [],
      intakeConversionValue: [],
      adjustmentType:        [],
      adjustmentDate:        [],
      adjustmentNote:        [],
      invoice:               [],
      packagedOrBulk:        [],
      priceScheduleID:       [],
      invoiceCode:           [],
      thcContent:            [],
      productionBatchNumber: [],
      sourceSiteID        : [],
      sourceSiteURL       : [],
      sourceSiteName      : [],
      destinationSiteID   : [],
      destinationSiteURL  : [],
      destinationSiteName : [],
      priceCategoryID     : [],
      rejected:             [],

      caseQuantity: [],
      casePrice: [],
      itemSku: [],
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
