import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable } from 'rxjs';
import { ISite, Paging}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface InventorySearchResultsPaged {
  results     : IInventoryAssignment[];
  paging      : Paging;
  errorMessage: string;
}

export interface IInventoryAssignment {
  id:                    number;
  packageType:           string;
  productName:           string;
  productCategoryName:   string;
  itemStrainName:        string;
  unitOfMeasureName:     string;
  unitMulitplier:        number;
  sku:                   string;
  label:                 string;
  metrcPackageID:        number;
  locationID:            number;
  location:              string;
  baseQuantity:          number;
  packageQuantity:       number;
  unitConvertedtoName:   string;
  productID:             number;
  packageCountRemaining: number;
  baseQuantityRemaining: number;
  dateCreated:           string;
  expiration:            string;
  facilityLicenseNumber: string;
  batchDate:             string;
  cost:                  number;
  price:                 number;
  notAvalibleForSale:    boolean;
  thc:                   number;
  thc2:                  number;
  thca2:                 number;
  thca:                  number;
  cbd:                   number;
  cbd2:                  number;
  cbda2:                 number;
  cbda:                  number;
  cbn:                   number;
  cbn2:                  number;
  employeeID:            number;
  employeeName:          string;
  requiresAttention:     boolean;
  jointWeight:           number;
  beginDate:             string;
  endDate:               string;
  intakeUOM:             string;
  intakeConversionValue: number;
  adjustmentType:        string;
  adjustmentDate:        string;
  adjustmentNote:        string;
  invoice:               string;
  packagedOrBulk:        number;
  priceScheduleID:       number;
  invoiceCode:           string;
  thcContent:            number;
  productionBatchNumber: string;
  serials:               Serial[];
}

export interface Serial {
  id:                    number;
  inventoryAssignmentID: number;
  sku:                   string;
  quantity:              number;
  serialCode:            string;
  adjustmentType:        string;
  adjustmentDate:        string;
  adjustmentNote:        string;
  beginDate:             string;
  endDate:               string;
}


export interface InventoryFilter {
  productName:          string;
  productCategoryName:  string;
  itemStrainName:       string;
  sku:                  string;
  label:                string;
  location:             string;
  noActiveCount:        boolean;
  packageType:          string;
  pageSize:             number;
  pageNumber:           number;
  notAvalibleForSale:   boolean;
  requiresAttention:    boolean;
  inventoryStatus:      number;
}

@Injectable({
  providedIn: 'root'
})

export class InventoryAssignmentService {

  constructor(
    private http: HttpClient,
    private auth: AuthenticationService,
    private fb  : FormBuilder,
    private siteService: SitesService)
  {
  }

  getSummaryOfGramsUsed(site: ISite, inventoryAssigments: IInventoryAssignment[], packageQuantity: number): any {
    if (inventoryAssigments) {
      let total = 0; inventoryAssigments.forEach(item =>
      {
        total += item.baseQuantity //* item.jointWeight
      })
      console.log('total used')
      return packageQuantity - total
    }
  }

 getInventoryAssignment(site: ISite, id: number): Observable<IInventoryAssignment> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `GetInventoryAssignment`

  const parameters = `?id=${id}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.get<IInventoryAssignment>(url)

 }

 getInventoryAssignmentHistory(site: ISite, id: number): Observable<IInventoryAssignment[]> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `getInventoryHistoryList`

  const parameters = `?id=${id}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.get<IInventoryAssignment[]>(url)

 }

 getInventory(site: ISite, inventoryFilter: InventoryFilter): Observable<InventorySearchResultsPaged> {

    const controller =  `/InventoryAssignments/`

    const endPoint = `getInventoryList`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.post<InventorySearchResultsPaged>(url, inventoryFilter)

  }

  getActiveInventory(site: ISite, inventoryFilter: InventoryFilter): Observable<InventorySearchResultsPaged> {

    inventoryFilter.noActiveCount = true

    const controller =  `/InventoryAssignments/`

    const endPoint = `postInventory`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.post<InventorySearchResultsPaged>(url, inventoryFilter)

  }


  getInActiveInventory(site: ISite, pageNumber: number, pageSize: number): Observable<InventorySearchResultsPaged> {

    const inventoryFilter = {}  as InventoryFilter;

    inventoryFilter.pageNumber = pageNumber
    inventoryFilter.pageSize = pageSize
    inventoryFilter.noActiveCount = true

    const controller =  `/InventoryAssignments/`

    const endPoint = `getInventoryList`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<InventorySearchResultsPaged>(url, inventoryFilter )


 }

 getInventoryByType(site: ISite,pageNumber: number, pageSize: number, type: string): Observable<InventorySearchResultsPaged> {

  const inventoryFilter = {}  as InventoryFilter;

  inventoryFilter.packageType = type
  inventoryFilter.pageNumber = pageNumber
  inventoryFilter.pageSize = pageSize
  inventoryFilter.noActiveCount = true

  const controller =  `/InventoryAssignments/`

  const endPoint = `getInventoryList`

  const parameters = ``

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.post<any>(url, inventoryFilter )

}

  // https://localhost:44309/api/InventoryAssignments/PutInventoryAssignment?id=8
editInventory(site: ISite, id: number, iInventoryAssignment: IInventoryAssignment): Observable<IInventoryAssignment> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `PutInventoryAssignment`

  const parameters = `?id=${id}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.put<IInventoryAssignment>(url, iInventoryAssignment)

}

moveInventory(site: ISite, iInventoryAssignment: IInventoryAssignment[]): Observable<IInventoryAssignment[]> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `moveInventory`

  const url = `${site.url}${controller}${endPoint}`

  return  this.http.post<IInventoryAssignment[]>(url, iInventoryAssignment)

}

addInventoryList(site: ISite, label: string, iInventoryAssignment: IInventoryAssignment[]): Observable<IInventoryAssignment[]> {

  console.log(iInventoryAssignment)
  const controller =  `/InventoryAssignments/`

  const endPoint = `PostInventoryAssignments`

  const parameters = `?label=${label}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.post<IInventoryAssignment[]>(url, iInventoryAssignment)

}

addInventoryItem(site: ISite,  iInventoryAssignment: IInventoryAssignment): Observable<IInventoryAssignment> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `PostInventoryAssignment`

  const parameters = ``

  const url = `${site.url}${controller}${endPoint}${parameters}`

  console.log('iInventoryAssignment', iInventoryAssignment)
  console.log('url', url)
  return  this.http.post<IInventoryAssignment>(url, iInventoryAssignment)


}

deleteInventory(site: ISite, id: number): Observable<IInventoryAssignment[]> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `DeleteInventoryAssignment`

  const parameters = `?id=${id}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.delete<IInventoryAssignment[]>(url)

}


  setNonConvertingFieldValues(inventoryAssignment: IInventoryAssignment,
                                        facility, inventoryLocation , intakeConversion, menuItem: IMenuItem, metrcPackage: METRCPackage ): IInventoryAssignment {

    // inventoryAssignment = this.inventoryAssignmentService.setNonConvertingFieldValues( )
    //assign values to inventoryAssignement
    inventoryAssignment.locationID            = inventoryLocation.id
    inventoryAssignment.location              = inventoryLocation.name

    inventoryAssignment.intakeUOM             = intakeConversion.name
    inventoryAssignment.intakeConversionValue = intakeConversion.value

    inventoryAssignment.facilityLicenseNumber = facility.metrcLicense

    inventoryAssignment.productID             = menuItem.id
    inventoryAssignment.productName           = menuItem.name
    inventoryAssignment.itemStrainName        = menuItem.name

    console.log(inventoryAssignment)

    inventoryAssignment.label                 = metrcPackage.label
    inventoryAssignment.metrcPackageID        = metrcPackage.id
    inventoryAssignment.packageType           = metrcPackage.packageType
    inventoryAssignment.unitOfMeasureName     = metrcPackage.unitOfMeasureName
    inventoryAssignment.productCategoryName   = metrcPackage.productCategoryName
    // metrcPackage.

    inventoryAssignment.notAvalibleForSale  = false
    if (!inventoryLocation.activeLocation) { inventoryAssignment.notAvalibleForSale  = true}
    inventoryAssignment.requiresAttention     = false

    inventoryAssignment.employeeName          = localStorage.getItem('username');
    inventoryAssignment.employeeID            = parseInt(localStorage.getItem('userID'));

    const d = new Date();
    inventoryAssignment.dateCreated           = d.toISOString()

    return inventoryAssignment
  }


  assignProductToInventory(menuItem: IMenuItem,  item: IInventoryAssignment) {
    if (item && menuItem) {
      item.productName = menuItem.name
      item.sku         = menuItem.sku;
      item.productID   = menuItem.id;
      item.cost        = menuItem.wholeSale;
      item.price       = menuItem.retail;
      item.notAvalibleForSale =  false;
      if (menuItem.itemType) {
        item.packageType = menuItem.itemType.name;
      }
      return item
    }
  }

  setItemValues(inputForm: FormGroup, item: IInventoryAssignment) {
    if (!item && !inputForm) {return item}
    const  controls = inputForm.controls
    try {
      item.packageCountRemaining = controls['packageQuantity'].value;
      item.baseQuantityRemaining = item.packageCountRemaining;

      item.dateCreated = new Date().toISOString();
      item.intakeConversionValue =1
      item.jointWeight = 1;
      item.baseQuantity = controls['packageQuantity'].value;
      item.price = controls['price'].value;
      item.cost  = controls['cost'].value;
    } catch (error) {
      console.log('error on set item values', error)
      return item
    }
    return item
  }
  assignChemicals(menuItem: IMenuItem, item: IInventoryAssignment) {
    if (!item && !menuItem) {return item}
    item.thc   = +menuItem.thc
    item.thc2  = +menuItem.thc2
    item.thca  = +menuItem.thca
    item.thca2 = +menuItem.thca2
    item.cbd   = +menuItem.cbd
    item.cbd2  = +menuItem.cbd2
    item.cbn   = +menuItem.cbn
    item.cbd2  = +menuItem.cbd2
    item.cbda2 = +menuItem.cbda2
    return item
  }
  initFields(inputForm: FormGroup) {
    inputForm = this.fb.group({
      id:                                [''],
      label:                             [''],
      packageType:                       [''],
      sourceHarvestName:                 [''],
      locationID:                        [''],
      locationName:                      [''],
      locationTypeName:                  [''],
      quantity:                          [''],
      quantityType:                      [''],
      unitOfMeasureName:                 [''],
      unitOfMeasureAbbreviation:         [''],
      patientLicenseNumber:              [''],
      itemFromFacilityLicenseNumber:     [''],
      itemFromFacilityName:              [''],
      itemStrainName:                    [''],
      note:                              [''],
      packagedDate:                      [''],
      initialLabTestingState:            [''],
      labTestingState:                   [''],
      labTestingStateDate:               [''],
      isProductionBatch:                 [''],
      productionBatchNumber:             [''],
      sourceProductionBatchNumbers:      [''],
      isTradeSample:                     [''],
      isTradeSamplePersistent:           [''],
      isDonation:                        [''],
      isDonationPersistent:              [''],
      sourcePackageIsDonation:           [''],
      isTestingSample:                   [''],
      isProcessValidationTestingSample:  [''],
      productRequiresRemediation:        [''],
      containsRemediatedProduct:         [''],
      remediationDate:                   [''],
      receivedDateTime:                  [''],
      receivedFromManifestNumber:        [''],
      receivedFrom:                      [''],
      facilityLicenseNumber:             [''],
      receivedFromFacilityName:          [''],
      isOnHold:                          [''],
      archivedDate:                      [''],
      finishedDate:                      [''],
      lastModified:                      [''],
      remainingCount:                    [''],
      inventoryImported:                 [''],
      metrcItemID:                       [''],
      productID:                         [''],
      productName:                       [''],
      productCategoryName:               [''],
      productCategoryType:               [''],
      inventoryLocationID :              [''],
      expiration:                        [''],
      conversionName  :                  [''],

      thc:                              [''],
      thc2:                             [''],
      thca:                             [''],
      thca2:                            [''],
      cbn:                              [''],
      cbn2:                             [''],
      cbd:                              [''],
      cbd2:                             [''],
      cbda2:                            [''],
      cbda:                             [''],

      //non data codes
      batchDate:                         [''],
      cost:                              [0],
      price:                             [0],
      jointWeight:                       [1],
      inputQuantity:                     [0],
      active        : [''],
      hasImported   : [''],
      }
    )
    return inputForm
  }

}
