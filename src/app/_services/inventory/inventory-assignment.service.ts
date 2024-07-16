import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { IPOSOrder, IProduct, ISite, IUser, Paging}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { InventoryManifest } from './manifest-inventory.service';
import { NewInventoryItemComponent } from 'src/app/modules/admin/inventory/new-inventory-item/new-inventory-item.component';
import { DialogRef } from '@angular/cdk/dialog';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
export interface InventorySearchResultsPaged {
  results     : IInventoryAssignment[];
  paging      : Paging;
  errorMessage: string;
  total       : number;
}

export interface AvalibleInventoryResults {
  results     : IInventoryAssignment[];
  total       : number;
  errorMessage: string;
}
export interface IInventoryAssignment {
  id:                    number;
  manifestID            :number;
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
  labName: string;
  producerName: string;
  facilityID: number;
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
  sourceSiteID        : number;
  sourceSiteURL       : string;
  sourceSiteName      : string;
  destinationSiteID   : number;
  destinationSiteURL  : string;
  destinationSiteName : string;
  rejected:             string;
  priceCategoryID     : number;
  productCountUpdated : boolean;
  poDetailID          : number;
  caseQuantity        : number;
  itemSku             : string;
  casePrice           : number;
  product             : IProduct;
  serials:              Serial[];
  ebayPublished       : boolean;
  used     : boolean;
  originID : number;
  vendor   : number
  createdAtTime : string;
  lastAuditDate : string;
  itemForm : string;
  description : string;
  testLotNumber : string;
  testDate : string;
  testedBy : string;
  batchdescription : string;
  itemTypeName : string;
  itemTypeID : number;
  brandID : number;
  itemSKU : string;
  images  : string;
  productCategoryID: number;
  departmentID: number;
  attribute: string;
  metaTags: string;
  sellByDate: string;
  labTestingPerformedDate: string;
  packagedDate: string;
  expirationDate: string;
  sourceHarvestName: string;
  json: string; //stores info like ebay publishing.
  color: string;
}

export interface inventoryJson {

  ebay: string;
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
  manifestID        :   number;
  manifestAssigned    : number;
  attribute         : string;
  departmentID      : number;
  metaTagsList      : string[]
}

export interface InventoryStatusList {
  name: string;
  id:   number;
}
@Injectable({
  providedIn: 'root'
})

export class InventoryAssignmentService {


  inventoryStatusList  = [
    {id: 1, name: 'In Stock - For Sale'},
    {id: 2, name: 'In Stock - Not for Sale'},
    {id: 3, name: 'Sold Out'},
    {id: 0, name:  'All'}
 ] as InventoryStatusList[]

 inventoryActiveList  = [
  {id: 1, name: 'Active'},
  {id: 2, name: 'All'},
  {id: 0, name: 'Inactive'}
] as InventoryStatusList[]

  private _avalibleInventoryResults = new BehaviorSubject<AvalibleInventoryResults>(null);
  public avalibleInventoryResults$  = this._avalibleInventoryResults.asObservable()
  public avalibleInventoryResults:   AvalibleInventoryResults;

  constructor(
    private http: HttpClient,
    private auth: AuthenticationService,
    private fb  : UntypedFormBuilder,
    private dialog: MatDialog,
    private siteService: SitesService)
  {
  }

  openInventoryItem(id: number) {
    return this.dialog.open(NewInventoryItemComponent,
      { width:        '90vw',
        minWidth:     '900px',
        height:       '90vh',
        minHeight:    '800px',
        data : {id: id}
      },
    )
  }

  createManifestFromOrder(site: ISite, manifest: InventoryManifest, order: IPOSOrder): Observable<InventoryManifest> {

    const controller =  `/InventoryAssignments/`

    const endPoint = `createManifestFromOrder`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const item = {manifest: manifest, order: order}

    return  this.http.post<InventoryManifest>(url, item )
  }

  rejectItemsInManifest(site: ISite, id: number, items: IInventoryAssignment[]): Observable<IInventoryAssignment[]> {

    const controller =  `/InventoryAssignments/`

    const endPoint = `rejectItemsInManifest`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IInventoryAssignment[]>(url)
  }

  updateAvalibleInventoryResults(results) {
    this.avalibleInventoryResults = results
    this._avalibleInventoryResults.next(results)
  }

  getAvalibleInventory(site: ISite, productID: number, active: boolean): Observable<AvalibleInventoryResults> {

      const controller =  `/InventoryAssignments/`

      let endPoint = `getAvalibleInventory`

      const user =  JSON.parse(localStorage.getItem('user')) as IUser

      if (!user || !user.roles || user.roles == '') {
        endPoint  = `getAvalibleInventoryNoRoles`
      }

      const parameters = `?ProductID=${productID}&availible=${active}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      console.log('url', url)

      return  this.http.get<AvalibleInventoryResults>(url)

  }

  getAvalibleInventorySearch(site: ISite, search: InventoryFilter): Observable<AvalibleInventoryResults> {

    const controller =  `/InventoryAssignments/`

    let endPoint = `getAvalibleInventorySearch`

    const user =  JSON.parse(localStorage.getItem('user')) as IUser

    if (!user || !user.roles || user.roles == '') {
      endPoint  = `getAvalibleInventorySearch`
    }

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<AvalibleInventoryResults>(url, search)

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

  assignItemsToManifest(site: ISite, id: number, iInventoryAssignment: IInventoryAssignment[]) {
    const controller =  `/InventoryAssignments/`

    const endPoint = `AssignToManifest`

    const parameters = `?manifestID=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IInventoryAssignment[]>(url, iInventoryAssignment)
  }
    // https://localhost:44309/api/InventoryAssignments/PutInventoryAssignment?id=8
  editInventory(site: ISite, id: number, item: IInventoryAssignment): Observable<IInventoryAssignment> {

    const controller =  `/InventoryAssignments/`

    const endPoint = `PutInventoryAssignment`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IInventoryAssignment>(url, item)

  }

  reconcileInventory(site: ISite, id: number, iInventoryAssignment: IInventoryAssignment): Observable<IInventoryAssignment> {

    const controller =  `/InventoryAssignments/`

    const endPoint = `reconcileInventory`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IInventoryAssignment>(url, iInventoryAssignment)

  }

  postUpdateInventoryLocations(site: ISite, id: number, iInventoryAssignment: IInventoryAssignment[]): Observable<IInventoryAssignment[]> {

    if (id == null) { return null}

    if (iInventoryAssignment == null) { return null}

    if (site == null) { return null}

    const controller =  `/InventoryAssignments/`

    const endPoint = `postUpdateInventoryLocations`

    const parameters = `?manifestID=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IInventoryAssignment[]>(url, iInventoryAssignment)

  }

  assignDefaultLocation(site: ISite, id: number) : Observable<IInventoryAssignment[]> {

    if (site == null) { return null}

    const controller =  `/InventoryAssignments/`

    const endPoint = `assignDefaultLocation`

    const parameters = `?manifestID=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IInventoryAssignment[]>(url)
  }

  postInventoryAssignmentList(site: ISite, id: number, list: IInventoryAssignment[]): Observable<IInventoryAssignment[]> {

    if (id == null) { return null}

    if (list == null) { return null}

    if (site == null) { return null}

    const controller =  `/InventoryAssignments/`

    const endPoint = `postInventoryAssignmentList`

    const parameters = `?manifestID=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IInventoryAssignment[]>(url, list)

  }


  putInventoryAssignment(site: ISite,item: IInventoryAssignment): Observable<IInventoryAssignment> {

    const controller =  `/InventoryAssignments/`

    const endPoint = `PutInventoryAssignment`

    const parameters = `?id=${item.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IInventoryAssignment>(url, item)

  }

  postInventoryAssignment(site: ISite,item: IInventoryAssignment, updateInventory: boolean): Observable<IInventoryAssignment> {

    const controller =  `/InventoryAssignments/`

    const endPoint = `PostInventoryAssignment`

    const parameters = `?updateInventory=${updateInventory}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IInventoryAssignment>(url, item)

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

    return  this.http.post<IInventoryAssignment>(url, iInventoryAssignment)


  }

  deleteInventory(site: ISite, id: number): Observable<IInventoryAssignment> {

    const controller =  `/InventoryAssignments/`

    const endPoint = `DeleteInventoryAssignment`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<IInventoryAssignment>(url)

  }

  setNonConvertingFieldValues(inventoryAssignment: IInventoryAssignment,
                                        facility, inventoryLocation , intakeConversion, menuItem: IMenuItem, metrcPackage: METRCPackage ): IInventoryAssignment {

    // inventoryAssignment = this.inventoryAssignmentService.setNonConvertingFieldValues( )
    //assign values to inventoryAssignement
    inventoryAssignment.locationID            = inventoryLocation?.id
    inventoryAssignment.location              = inventoryLocation?.name

    inventoryAssignment.intakeUOM             = intakeConversion?.name
    inventoryAssignment.intakeConversionValue = intakeConversion?.value

    inventoryAssignment.facilityLicenseNumber = facility?.metrcLicense

    inventoryAssignment.productID             = menuItem?.id
    inventoryAssignment.productName           = menuItem?.name
    inventoryAssignment.itemStrainName        = menuItem?.name

    inventoryAssignment.label                 = metrcPackage?.label
    inventoryAssignment.metrcPackageID        = metrcPackage?.id
    inventoryAssignment.packageType           = metrcPackage?.packageType
    inventoryAssignment.unitOfMeasureName     = metrcPackage?.unitOfMeasureName
    inventoryAssignment.productCategoryName   = metrcPackage?.productCategoryName
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
    if (!item) {item = {} as IInventoryAssignment}

    item.productName = menuItem?.name
    item.label       = menuItem?.sku;
    item.productID   = menuItem?.id;
    item.cost        = menuItem?.wholesale;
    // item.price       = menuItem?.retail;
    // item.productCategoryID = menuItem?.categoryID;
    item.notAvalibleForSale =  false;
    item.itemTypeID = menuItem?.itemType?.id;
    item.packageType = menuItem?.itemType?.name;
    // console.log('assignProductToInventory', item)
    return item
  }

  generateSku(sku: string, index: number): string {
    return `ps-${sku.substring(sku.length - 7)}-${index}`
  }

  setItemValues(inputForm: UntypedFormGroup, item: IInventoryAssignment) {
    if (!item && !inputForm) {return item}
    const  controls = inputForm.controls
    try {

      item.dateCreated = new Date().toISOString();
      item.expiration   = controls['expiration'].value;
      item.packageCountRemaining = controls['packageQuantity'].value;

      item.baseQuantityRemaining = item?.packageCountRemaining;
      item.packageQuantity       = item?.packageCountRemaining;
      item.baseQuantity          = item?.packageCountRemaining;
      item.jointWeight           = 1;
      item.images                = controls['images'].value;
      item.notAvalibleForSale    = controls['notAvalibleForSale'].value;
      item.invoice               = controls['invoiceCode'].value;
      item.location              = controls['location'].value;
      item.locationID            = controls['locationID'].value;
      item.unitOfMeasureName     = controls['unitOfMeasureName'].value;
      item.intakeConversionValue =1
      if (  item.jointWeight == 0) {  item.jointWeight = 1; }

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
    item.thc   = +menuItem?.thc
    item.thc2  = +menuItem?.thc2
    item.thca  = +menuItem?.thca
    item.thca2 = +menuItem?.thca2
    item.cbd   = +menuItem?.cbd
    item.cbd2  = +menuItem?.cbd2
    item.cbn   = +menuItem?.cbn
    item.cbd2  = +menuItem?.cbd2
    item.cbda2 = +menuItem?.cbda2
    return item
  }

  initFields(inputForm: UntypedFormGroup) {
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
        testDate        :                  [''],
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
        terpenes:                         [''],
        mGTCH:                            [''],
        mGCBD:                            [''],
        childProof                        :[],

        //non data codes
        batchDate:                         [''],
        cost:                              [0],
        price:                             [0],
        jointWeight:                       [1],
        inputQuantity:                     [0],
        active                             : [''],
        hasImported                        : [''],
        priceCategoryID                   :[0],
        departmentID                     : [],
        metaTags                         : [],
        attribute                        : [],

        productname                      : [],
        intakeConversionValue           : [],
        sellByDate                      : [],
        labTestingPerformedDate         : [],
        expirationDate                  : [],
        useByDate                       : [],

        json                             : [],
      }
    )
    return inputForm
  }

}
